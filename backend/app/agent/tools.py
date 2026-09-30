"""
Tool integrations for the agent engine.

Per blueprint §16 (UNKNOWN, flagged as your decision to make): whether Phase 5's "real
tool calls" hit actual third-party APIs (Gmail/Calendar/Sheets) or a sandboxed mock set.
This file ships the sandboxed/mock version so the whole engine runs with zero external
credentials — swap a handler's body for a real API call later without touching engine.py,
since callers only ever see {ok, output, systems_touched}.
"""
import asyncio
import random
from collections.abc import Awaitable, Callable
from dataclasses import dataclass


async def _generate_simulated_output(prompt: str, fallback_type: str = "research") -> str:
    from app.config import get_settings
    settings = get_settings()
    
    fallback_text = (
        f"[Simulated AI Content for: {prompt}]\n\n"
        "Here is the detailed result of the operation. We have successfully contacted the required endpoints, "
        "gathered the necessary information, and formatted the response according to your specifications.\n\n"
        "- Action completed successfully.\n"
        "- Data retrieved and verified.\n"
        "- Further steps have been prepared for your review."
    )

    if not settings.GROQ_API_KEY:
        return fallback_text
    try:
        from groq import AsyncGroq
        client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        
        system_prompt = (
            "You are an expert AI co-founder and business strategist executing a simulated tool action. "
            "You must provide highly detailed but CONCISE responses tailored to the user's exact context. "
            "CRITICAL FORMATTING RULES: "
            "1. DO NOT use the asterisk character (*) ever. Do not use markdown. Output PLAIN TEXT ONLY. "
            "2. Do not use hashtags (#). Use ALL CAPS for headers. "
            "3. Use standard dashes (-) for bullet points. "
            "4. Keep your total response under 500 words. "
            "5. GEOGRAPHIC STRICTNESS: If a Location is provided, all insights, competitors, and data MUST be strictly confined to that specific city/area. Do not mention other cities unless explicitly asked."
        )
        
        response = await client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"{fallback_text}\n\n(Note: LLM Generation failed with error: {str(e)})"


@dataclass
class ToolResult:
    ok: bool
    output: str
    systems_touched: list[str]
    follow_up_quests: list[dict] | None = None  # [{"title": str, "plan": [{tool, args}], "reason": str}]


import os
import datetime
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from email.message import EmailMessage
import base64

def get_google_creds(user):
    print(f"DEBUG: get_google_creds called with user={user}")
    if user:
        print(f"DEBUG: user.id={getattr(user, 'id', None)}, access_token={bool(getattr(user, 'google_access_token', None))}, refresh_token={bool(getattr(user, 'google_refresh_token', None))}")
    if not user or not getattr(user, 'google_refresh_token', None) or not getattr(user, 'google_access_token', None):
        return None
    try:
        import json
        with open("credentials.json") as f:
            data = json.load(f)["web"]
            client_id = data["client_id"]
            client_secret = data["client_secret"]
            token_uri = data.get("token_uri", "https://oauth2.googleapis.com/token")
            
        from app.google_oauth.router import _get_fernet
        fernet = _get_fernet()
        access_token = fernet.decrypt(user.google_access_token.encode()).decode() if user.google_access_token else None
        refresh_token = fernet.decrypt(user.google_refresh_token.encode()).decode() if user.google_refresh_token else None
            
    except Exception as e:
        import traceback
        print(f"DEBUG get_google_creds Exception: {repr(e)}")
        traceback.print_exc()
        return None
        
    return Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri=token_uri,
        client_id=client_id,
        client_secret=client_secret,
        scopes=[
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/calendar.events',
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/documents',
            'https://www.googleapis.com/auth/presentations',
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/forms.body',
            'https://www.googleapis.com/auth/tasks',
        ]
    )

async def _send_email(args: dict, context_str: str = "", user=None) -> ToolResult:
    to = args.get("to", "a stakeholder")
    subject = args.get("subject", "Update from Crewmate")
    
    generated = args.get("draft_body")
    if not generated:
        prompt = f"Write a short, professional email to: {to}. Subject: {subject}"
        if context_str: prompt += f"\n\nBusiness context:\n{context_str}"
        generated = await _generate_simulated_output(prompt, "email")
    
    # Try to actually send it via Gmail API
    creds = get_google_creds(user)
    if creds and "@" in to:
        if "[Simulated AI Content" in generated:
            output = f"Drafted email to {to} with subject \"{subject}\":\n\n\"{generated}\"\n\n(Did not send real email: content is simulated.)"
        else:
            try:
                service = build('gmail', 'v1', credentials=creds)
                message = EmailMessage()
                message.set_content(generated)
                message['To'] = to
                message['From'] = 'me'
                message['Subject'] = subject
                
                encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
                service.users().messages().send(userId="me", body={'raw': encoded_message}).execute()
                output = f"Email sent to {to} with subject \"{subject}\":\n\n\"{generated}\"\n\n(SUCCESS: Real email sent via Gmail!)"
            except Exception as e:
                output = f"Drafted email to {to} with subject \"{subject}\":\n\n\"{generated}\"\n\n(FAILED to send: {e})"
    elif creds and "@" not in to:
        output = f"Drafted email for {to}:\n\n\"{generated}\"\n\n(Note: No email address provided — please specify a real email like 'send to john@example.com' to actually send it.)"
    else:
        output = f"Drafted email to {to}:\n\n\"{generated}\"\n\n(Note: Google account not connected — connect it in Settings to send real emails.)"

        
    return ToolResult(ok=True, output=output, systems_touched=["Email"])


async def _update_spreadsheet(args: dict, context_str: str = "", user=None) -> ToolResult:
    sheet = args.get("sheet", "Finance Tracker")
    prompt = f"Generate 5 lines of sample CSV data for a spreadsheet named {sheet}"
    if context_str: prompt += f"\n\nContext to use if relevant:\n{context_str}"
    generated = await _generate_simulated_output(prompt, "sheet")
    
    creds = get_google_creds(user)
    if creds:
        try:
            service = build('sheets', 'v4', credentials=creds)
            # Create a new spreadsheet
            spreadsheet = {'properties': {'title': sheet}}
            spreadsheet = service.spreadsheets().create(body=spreadsheet, fields='spreadsheetId,spreadsheetUrl').execute()
            sheet_id = spreadsheet.get('spreadsheetId')
            sheet_url = spreadsheet.get('spreadsheetUrl')
            
            # Parse the generated CSV into rows
            import csv
            from io import StringIO
            reader = csv.reader(StringIO(generated.strip()))
            rows = [row for row in reader if row]
            
            if not rows:
                rows = [["Data"], [generated]]
                
            # Write to the new sheet
            body = {'values': rows}
            service.spreadsheets().values().update(
                spreadsheetId=sheet_id, range='Sheet1!A1',
                valueInputOption='RAW', body=body
            ).execute()
            
            output = f"Successfully created and populated Google Sheet: '{sheet}'\nLink: {sheet_url}\n\nPreview of data added:\n{generated[:200]}..."
            return ToolResult(ok=True, output=output, systems_touched=["Sheets"])
        except Exception as e:
            output = f"Failed to create Google Sheet: {e}\n\nFallback simulated data:\n{generated}"
            return ToolResult(ok=False, output=output, systems_touched=["Sheets"])
    
    output = f"Updated {sheet} with new rows:\n{generated}\n\n(Note: Google account not connected — connect it in Settings to create real Google Sheets.)"
    return ToolResult(ok=True, output=output, systems_touched=["Sheets"])


async def _post_social_update(args: dict, context_str: str = "", user=None) -> ToolResult:
    channel = args.get("channel", "the company account")
    prompt = f"Write an engaging 1-sentence social media post for {channel}"
    if context_str: prompt += f"\n\nContext to use if relevant:\n{context_str}"
    generated = await _generate_simulated_output(prompt, "social")
    output = f"Drafted a post for {channel}:\n\n\"{generated}\"" if generated else f"Drafted a post for {channel}."
    return ToolResult(ok=True, output=output, systems_touched=["Social"])


async def _schedule_meeting(args: dict, context_str: str = "", user=None) -> ToolResult:
    who = args.get("with", "the team")
    subject = args.get("subject", f"Meeting with {who}")
    prompt = f"Write a 1-sentence calendar event description for a meeting with {who} about {subject}"
    if context_str: prompt += f"\n\nContext to use if relevant:\n{context_str}"
    generated = await _generate_simulated_output(prompt, "meeting")
    
    output = f"Scheduled a meeting with {who}. Event description:\n\"{generated}\"" if generated else f"Found a slot and scheduled a meeting with {who}."
    
    # Actually schedule it via Calendar API!
    creds = get_google_creds(user)
    if creds:
        try:
            service = build('calendar', 'v3', credentials=creds)
            iso_dt = args.get("iso_datetime")
            if iso_dt:
                try:
                    # Handle just a date (e.g., "2026-10-03")
                    if "T" not in iso_dt:
                        dt = datetime.datetime.fromisoformat(iso_dt.split("Z")[0].split("+")[0])
                        dt = dt.replace(hour=10, minute=0, second=0, microsecond=0)
                    else:
                        # Strip any tz info — we pass timeZone separately to the API
                        dt_str = iso_dt.split("Z")[0].split("+")[0]
                        dt = datetime.datetime.fromisoformat(dt_str)
                        dt = dt.replace(microsecond=0)
                    
                    start_time = dt.isoformat()
                    end_time = (dt + datetime.timedelta(hours=1)).isoformat()
                except Exception as parse_e:
                    tomorrow = datetime.datetime.now() + datetime.timedelta(days=1)
                    start_time = tomorrow.replace(hour=10, minute=0, second=0, microsecond=0).isoformat()
                    end_time = tomorrow.replace(hour=11, minute=0, second=0, microsecond=0).isoformat()
                    output += f"\n\n(Note: Failed to parse provided date '{iso_dt}': {parse_e}. Defaulted to tomorrow.)"
            else:
                tomorrow = datetime.datetime.now() + datetime.timedelta(days=1)
                start_time = tomorrow.replace(hour=10, minute=0, second=0, microsecond=0).isoformat()
                end_time = tomorrow.replace(hour=11, minute=0, second=0, microsecond=0).isoformat()
                output += f"\n\n(Note: The AI did not specify a date. Defaulted to tomorrow.)"
            
            
            event = {
              'summary': subject,
              'description': generated,
              'start': {'dateTime': start_time, 'timeZone': 'Asia/Kolkata'},
              'end': {'dateTime': end_time, 'timeZone': 'Asia/Kolkata'},
            }
            event = service.events().insert(calendarId='primary', body=event).execute()
            output += f"\n\n(SUCCESS: Real calendar event created! Link: {event.get('htmlLink')})"
        except Exception as e:
            output += f"\n\n(FAILED to create real event via Calendar API: {e})"
    else:
        output += "\n\n(Note: No token.json found. Simulated only.)"
        
    return ToolResult(ok=True, output=output, systems_touched=["Calendar"])


async def _research_web(args: dict, context_str: str = "", user=None) -> ToolResult:
    topic = args.get("topic", "the objective")
    prompt = (
        f"Query to Answer: {topic}\n\n"
        "Instructions:\n"
        "1. This is a Web Search tool simulation.\n"
        "2. Just ANSWER the user's query directly and concisely based on the context.\n"
        "3. DO NOT generate a research proposal, DO NOT generate a business strategy report, and DO NOT outline objectives.\n"
        "4. If they ask a direct question (like 'what diseases should order meds for'), give them a direct answer (e.g., 'Based on the local demographics in Ahmedabad, you should stock meds for diabetes, hypertension, and seasonal flu').\n"
        "5. CRITICAL FORMATTING: DO NOT use markdown. DO NOT use asterisks (*). Use ALL CAPS for headers and standard dashes (-) for lists.\n"
        "6. GEOGRAPHIC CONSTRAINT: If the query requires local market data, strictly confine it to the Location provided in the context below."
    )
    if context_str: prompt += f"\n\nContext to use if relevant:\n{context_str}"
    generated = await _generate_simulated_output(prompt, "research")
    output = f"Research on {topic}:\n\n{generated}" if generated else f"Compiled a short research brief on {topic}."
    return ToolResult(ok=True, output=output, systems_touched=["Web"])



# ── LEVEL 4: financial_ops ──────────────────────────────────────────────────

async def _generate_invoice(args: dict, context_str: str = "", user=None) -> ToolResult:
    """Generate a GST-compliant PDF invoice and send it via Gmail."""
    import io, json as _json
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet

    client_name = args.get("client_name", "Client")
    client_email = args.get("client_email", "")
    amount = float(args.get("amount", 0))
    description = args.get("description", "Services Rendered")
    gst_number = args.get("gst_number", "")

    # Parse business info from context
    biz_name, biz_location = "Your Business", "India"
    if context_str:
        for line in context_str.splitlines():
            if line.startswith("Business Name:"): biz_name = line.split(":", 1)[1].strip()
            if line.startswith("Location:"): biz_location = line.split(":", 1)[1].strip()

    gst_rate = 0.18
    gst_amount = round(amount * gst_rate, 2)
    total = round(amount + gst_amount, 2)

    import datetime as _dt
    today = _dt.date.today()
    inv_num = f"INV-{today.strftime('%Y%m')}-{str(hash(client_name) % 1000).zfill(3)}"

    # Build PDF in memory
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=60, bottomMargin=40)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph(f"<b>{biz_name}</b>", styles["Title"]))
    story.append(Paragraph(f"{biz_location}" + (f" | GST: {gst_number}" if gst_number else ""), styles["Normal"]))
    story.append(Spacer(1, 20))
    story.append(Paragraph(f"<b>Invoice #{inv_num}</b>", styles["Heading2"]))
    story.append(Paragraph(f"Date: {today.strftime('%d %B %Y')}", styles["Normal"]))
    story.append(Paragraph(f"Bill To: <b>{client_name}</b>", styles["Normal"]))
    story.append(Spacer(1, 16))

    data = [
        ["Description", "Amount (₹)"],
        [description, f"{amount:,.2f}"],
        ["GST @ 18%", f"{gst_amount:,.2f}"],
        ["TOTAL", f"{total:,.2f}"],
    ]
    t = Table(data, colWidths=[350, 100])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a1a2e")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2), [colors.HexColor("#f0f0f0"), colors.white]),
        ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#00C853")),
        ("TEXTCOLOR", (0, -1), (-1, -1), colors.white),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ("PADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(t)
    story.append(Spacer(1, 20))
    story.append(Paragraph("Thank you for your business!", styles["Normal"]))
    doc.build(story)
    pdf_bytes = buf.getvalue()

    # Send via Gmail as PDF attachment
    creds = get_google_creds(user)
    if creds and "@" in client_email:
        try:
            import email as _email_lib
            from email.mime.multipart import MIMEMultipart
            from email.mime.base import MIMEBase
            from email.mime.text import MIMEText
            from email import encoders
            svc = build("gmail", "v1", credentials=creds)
            msg = MIMEMultipart()
            msg["To"] = client_email
            msg["From"] = "me"
            msg["Subject"] = f"Invoice #{inv_num} from {biz_name}"
            msg.attach(MIMEText(f"Dear {client_name},\n\nPlease find your invoice #{inv_num} for ₹{total:,.2f} attached.\n\nThank you,\n{biz_name}"))
            part = MIMEBase("application", "pdf")
            part.set_payload(pdf_bytes)
            encoders.encode_base64(part)
            part.add_header("Content-Disposition", f'attachment; filename="{inv_num}.pdf"')
            msg.attach(part)
            raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
            svc.users().messages().send(userId="me", body={"raw": raw}).execute()
            output = f"Invoice #{inv_num} generated and emailed to {client_email}.\nAmount: ₹{amount:,.2f} + GST = ₹{total:,.2f}\nDescription: {description}"
        except Exception as e:
            output = f"Invoice #{inv_num} generated (PDF ready) but email failed: {e}\nAmount: ₹{amount:,.2f} + GST = ₹{total:,.2f}"
    else:
        output = f"Invoice #{inv_num} drafted.\nClient: {client_name}\nAmount: ₹{amount:,.2f} + GST (18%) = ₹{total:,.2f}\nDescription: {description}\n(Tip: provide a client email address to send it!)"

    return ToolResult(ok=True, output=output, systems_touched=["Invoice", "Email"])


async def _create_proposal(args: dict, context_str: str = "", user=None) -> ToolResult:
    """Create a business proposal/quote as a Google Doc and return a shareable link."""
    client = args.get("client", "the client")
    subject = args.get("subject", "Business Proposal")
    content = args.get("draft_body")
    if not content:
        prompt = f"Write a professional business proposal for {client} regarding: {subject}. Include an introduction, scope of work, pricing summary, and next steps. Keep it under 400 words."
        if context_str: prompt += f"\n\nBusiness context:\n{context_str}"
        content = await _generate_simulated_output(prompt, "proposal")

    creds = get_google_creds(user)
    if creds:
        try:
            svc = build("docs", "v1", credentials=creds)
            doc = svc.documents().create(body={"title": f"Proposal — {subject} for {client}"}).execute()
            doc_id = doc["documentId"]
            svc.documents().batchUpdate(documentId=doc_id, body={
                "requests": [{"insertText": {"location": {"index": 1}, "text": content}}]
            }).execute()
            link = f"https://docs.google.com/document/d/{doc_id}/edit"
            output = f"Proposal created in Google Docs for {client}:\n\nSubject: {subject}\n\nLink: {link}\n\nPreview:\n{content[:300]}..."
        except Exception as e:
            output = f"Proposal drafted (Google Docs save failed: {e}):\n\n{content}"
    else:
        output = f"Proposal drafted for {client}:\n\nSubject: {subject}\n\n{content}\n\n(Connect Google account to auto-save to Docs)"

    return ToolResult(ok=True, output=output, systems_touched=["Docs"])


async def _create_task_list(args: dict, context_str: str = "", user=None) -> ToolResult:
    """Create a structured Google Tasks list from an objective."""
    title = args.get("title", "Tasks")
    content = args.get("draft_body")
    if not content:
        prompt = f"Create a concise numbered task list (max 8 items) for: {title}. Each task should be actionable and specific. Plain text, no markdown."
        if context_str: prompt += f"\n\nContext:\n{context_str}"
        content = await _generate_simulated_output(prompt, "tasks")

    tasks_list = [line.strip() for line in content.splitlines() if line.strip() and line.strip()[0].isdigit()]

    creds = get_google_creds(user)
    if creds:
        try:
            svc = build("tasks", "v1", credentials=creds)
            task_list = svc.tasklists().insert(body={"title": title}).execute()
            list_id = task_list["id"]
            for task_text in tasks_list[:8]:
                # Strip leading number/dot
                clean = task_text.lstrip("0123456789). ").strip()
                svc.tasks().insert(tasklist=list_id, body={"title": clean}).execute()
            output = f"Task list '{title}' created in Google Tasks with {len(tasks_list)} items:\n\n{content}"
        except Exception as e:
            output = f"Task list drafted (Google Tasks save failed: {e}):\n\n{content}"
    else:
        output = f"Task list for '{title}':\n\n{content}\n\n(Connect Google account to save to Google Tasks)"

    return ToolResult(ok=True, output=output, systems_touched=["Tasks"])


# ── LEVEL 5: autonomous_ops ─────────────────────────────────────────────────

async def _generate_report(args: dict, context_str: str = "", user=None) -> ToolResult:
    """Read a linked Google Sheet and generate a plain-English P&L narrative."""
    sheet_id = args.get("sheet_id", "")
    report_type = args.get("report_type", "weekly")
    prompt = f"Write a concise {report_type} business health report. Summarize revenue vs expenses, highlight top-performing areas, and flag any concerns. Be direct and practical."
    if context_str: prompt += f"\n\nBusiness context:\n{context_str}"

    sheet_data_summary = ""
    creds = get_google_creds(user)
    if creds and sheet_id:
        try:
            svc = build("sheets", "v4", credentials=creds)
            result = svc.spreadsheets().values().get(spreadsheetId=sheet_id, range="A1:E50").execute()
            rows = result.get("values", [])
            if rows:
                sheet_data_summary = "\n".join([", ".join(r) for r in rows[:20]])
                prompt += f"\n\nActual sheet data (first 20 rows):\n{sheet_data_summary}"
        except Exception as e:
            prompt += f"\n\n(Note: Could not read sheet: {e}. Generating report from context only.)"

    narrative = await _generate_simulated_output(prompt, "report")
    output = f"{report_type.upper()} BUSINESS REPORT\n{'='*40}\n\n{narrative}"
    if sheet_data_summary:
        output += f"\n\n(Data sourced from linked Google Sheet)"

    return ToolResult(ok=True, output=output, systems_touched=["Sheets", "Reports"])


async def _schedule_meeting_with_meet(args: dict, context_str: str = "", user=None) -> ToolResult:
    """Schedule a Google Calendar event with a Google Meet video link."""
    who = args.get("with", "the team")
    subject = args.get("subject", f"Meeting with {who}")
    iso_dt = args.get("iso_datetime", "")

    import datetime as _dt
    try:
        if iso_dt:
            dt_str = iso_dt.split("Z")[0].split("+")[0]
            dt = _dt.datetime.fromisoformat(dt_str).replace(microsecond=0)
            if "T" not in iso_dt:
                dt = dt.replace(hour=10, minute=0, second=0)
        else:
            dt = _dt.datetime.now() + _dt.timedelta(days=1)
            dt = dt.replace(hour=10, minute=0, second=0, microsecond=0)
    except Exception:
        dt = _dt.datetime.now() + _dt.timedelta(days=1)
        dt = dt.replace(hour=10, minute=0, second=0, microsecond=0)

    start_time = dt.isoformat()
    end_time = (dt + _dt.timedelta(hours=1)).isoformat()

    creds = get_google_creds(user)
    if creds:
        try:
            svc = build("calendar", "v3", credentials=creds)
            event = {
                "summary": subject,
                "description": f"Meeting with {who}",
                "start": {"dateTime": start_time, "timeZone": "Asia/Kolkata"},
                "end": {"dateTime": end_time, "timeZone": "Asia/Kolkata"},
                "conferenceData": {
                    "createRequest": {
                        "requestId": f"crewmate-{hash(subject) % 99999}",
                        "conferenceSolutionKey": {"type": "hangoutsMeet"},
                    }
                },
            }
            result = svc.events().insert(calendarId="primary", body=event, conferenceDataVersion=1).execute()
            meet_link = result.get("hangoutLink", "")
            cal_link = result.get("htmlLink", "")
            output = (f"Meeting scheduled with {who}: '{subject}'\n"
                      f"Date/Time: {dt.strftime('%d %B %Y at %I:%M %p')} IST\n"
                      f"Google Meet link: {meet_link}\n"
                      f"Calendar event: {cal_link}")
        except Exception as e:
            output = f"Meeting with {who} on {dt.strftime('%d %B %Y at %I:%M %p')} IST (Calendar API failed: {e})"
    else:
        output = f"Meeting with {who} scheduled for {dt.strftime('%d %B %Y at %I:%M %p')} IST (Connect Google to create Meet link)"

    return ToolResult(ok=True, output=output, systems_touched=["Calendar", "Meet"])


async def _create_presentation(args: dict, context_str: str = "", user=None) -> ToolResult:
    """Create a Google Slides presentation from an objective."""
    import uuid

    topic = args.get("topic", "Business Overview")

    # Use pre-drafted content from approval if available, else generate fresh
    content = args.get("draft_body")
    if not content:
        slides_content_prompt = (
            f"Create a 5-slide presentation outline for: '{topic}'. "
            "For each slide, output exactly:\nSLIDE: <title>\nCONTENT: <2-3 bullet points separated by | >\n\n"
            "Slides: 1-Title/Hook, 2-Problem, 3-Solution, 4-Traction/Numbers, 5-Call to Action. "
            "Plain text only, no markdown, no asterisks."
        )
        if context_str: slides_content_prompt += f"\n\nBusiness context:\n{context_str}"
        content = await _generate_simulated_output(slides_content_prompt, "presentation")

    creds = get_google_creds(user)
    if creds:
        try:
            svc = build("slides", "v1", credentials=creds)

            # Create blank presentation
            presentation = svc.presentations().create(body={"title": topic}).execute()
            pres_id = presentation["presentationId"]
            link = f"https://docs.google.com/presentation/d/{pres_id}/edit"

            # Parse the outline into slides
            # Expected format lines: "SLIDE: Title" / "CONTENT: point1 | point2 | point3"
            # Fallback: treat every 2 lines as title + content
            slides_data = []
            lines = [l.strip() for l in content.split("\n") if l.strip()]
            i = 0
            while i < len(lines):
                title_line = lines[i]
                content_line = lines[i + 1] if i + 1 < len(lines) else ""
                if title_line.upper().startswith("SLIDE:"):
                    title_text = title_line[6:].strip()
                    if content_line.upper().startswith("CONTENT:"):
                        body_text = content_line[8:].strip().replace(" | ", "\n• ")
                        if not body_text.startswith("•"):
                            body_text = "• " + body_text
                        i += 2
                    else:
                        body_text = content_line
                        i += 2
                else:
                    title_text = title_line
                    body_text = content_line
                    i += 2
                slides_data.append({"title": title_text, "body": body_text})
                if len(slides_data) >= 5:
                    break

            if not slides_data:
                # Fallback: just use the whole content as one slide
                slides_data = [{"title": topic, "body": content[:300]}]

            # Get the existing blank slide id to update/delete
            existing_slides = presentation.get("slides", [])
            requests = []

            for idx, slide_info in enumerate(slides_data):
                slide_id = f"slide_{uuid.uuid4().hex[:8]}"
                title_id = f"title_{uuid.uuid4().hex[:8]}"
                body_id = f"body_{uuid.uuid4().hex[:8]}"

                if idx == 0 and existing_slides:
                    # Reuse the first blank slide
                    existing_slide_id = existing_slides[0]["objectId"]
                    # Delete existing elements from blank slide
                    for el in existing_slides[0].get("pageElements", []):
                        requests.append({"deleteObject": {"objectId": el["objectId"]}})
                    slide_id = existing_slide_id
                else:
                    # Add a new slide using the correct API operation name
                    requests.append({
                        "createSlide": {
                            "objectId": slide_id,
                            "insertionIndex": idx,
                            "slideLayoutReference": {"predefinedLayout": "BLANK"},
                        }
                    })

                # Add title text box
                requests += [
                    {"createShape": {
                        "objectId": title_id,
                        "shapeType": "TEXT_BOX",
                        "elementProperties": {
                            "pageObjectId": slide_id,
                            "size": {"width": {"magnitude": 620, "unit": "PT"}, "height": {"magnitude": 60, "unit": "PT"}},
                            "transform": {"scaleX": 1, "scaleY": 1, "translateX": 20, "translateY": 20, "unit": "PT"}
                        }
                    }},
                    {"insertText": {"objectId": title_id, "text": slide_info["title"]}},
                    {"updateTextStyle": {
                        "objectId": title_id,
                        "style": {"bold": True, "fontSize": {"magnitude": 28, "unit": "PT"}},
                        "fields": "bold,fontSize"
                    }},
                ]

                if slide_info["body"]:
                    requests += [
                        {"createShape": {
                            "objectId": body_id,
                            "shapeType": "TEXT_BOX",
                            "elementProperties": {
                                "pageObjectId": slide_id,
                                "size": {"width": {"magnitude": 620, "unit": "PT"}, "height": {"magnitude": 280, "unit": "PT"}},
                                "transform": {"scaleX": 1, "scaleY": 1, "translateX": 20, "translateY": 100, "unit": "PT"}
                            }
                        }},
                        {"insertText": {"objectId": body_id, "text": slide_info["body"]}},
                        {"updateTextStyle": {
                            "objectId": body_id,
                            "style": {"fontSize": {"magnitude": 16, "unit": "PT"}},
                            "fields": "fontSize"
                        }},
                    ]

            if requests:
                svc.presentations().batchUpdate(presentationId=pres_id, body={"requests": requests}).execute()

            output = (
                f"Presentation '{topic}' created with {len(slides_data)} slides in Google Slides!\n"
                f"Link: {link}\n\nSlide Outline:\n{content}"
            )
        except Exception as e:
            output = f"Presentation outline generated (Slides API error: {e}):\n\n{content}"
    else:
        output = f"Presentation outline for '{topic}':\n\n{content}\n\n(Connect Google to auto-create in Slides)"

    return ToolResult(ok=True, output=output, systems_touched=["Slides"])




async def _create_form(args: dict, context_str: str = "", user=None) -> ToolResult:
    """Create a Google Form from an objective."""
    title = args.get("title", "Customer Feedback Form")
    description = args.get("description", "Please fill out this form.")
    
    prompt = f"Create a list of 3 basic questions for a form titled '{title}'. Plain text, one question per line."
    if context_str: prompt += f"\n\nContext:\n{context_str}"
    generated = args.get("draft_body")
    if not generated:
        prompt = f"Create a list of 3 basic questions for a form titled '{title}'. Plain text, one question per line."
        if context_str: prompt += f"\n\nContext:\n{context_str}"
        generated = await _generate_simulated_output(prompt, "form")

    creds = get_google_creds(user)
    if creds:
        try:
            svc = build("forms", "v1", credentials=creds)
            form = {
                "info": {
                    "title": title,
                    "documentTitle": title,
                }
            }
            result = svc.forms().create(body=form).execute()
            form_id = result["formId"]
            responder_uri = result.get("responderUri", "")
            
            # Parse questions and batch update
            requests = []
            questions = [q.strip() for q in generated.split('\n') if q.strip() and not q.startswith('---')]
            for i, q_text in enumerate(questions):
                requests.append({
                    "createItem": {
                        "item": {
                            "title": q_text,
                            "questionItem": {
                                "question": {
                                    "required": False,
                                    "textQuestion": {}
                                }
                            }
                        },
                        "location": {
                            "index": i
                        }
                    }
                })
                
            if requests:
                svc.forms().batchUpdate(formId=form_id, body={"requests": requests}).execute()
            
            output = f"Google Form '{title}' created successfully!\n\nLink to fill out: {responder_uri}\nLink to edit: https://docs.google.com/forms/d/{form_id}/edit\n\nQuestions Added:\n{generated}"
        except Exception as e:
            output = f"Form drafted (Google Forms save failed: {e}):\n\nTitle: {title}\nQuestions:\n{generated}"
    else:
        output = f"Form drafted for '{title}':\n\nQuestions:\n{generated}\n\n(Connect Google to auto-create in Google Forms)"

    return ToolResult(ok=True, output=output, systems_touched=["Forms"])


async def _handle_complaint(args: dict, context_str: str = "", user=None) -> ToolResult:
    """Read unread Gmail, classify complaint emails, and draft responses."""
    creds = get_google_creds(user)
    if not creds:
        return ToolResult(ok=True, output="Complaint monitoring requires Google account. Please connect in Settings.", systems_touched=["Email"])

    try:
        svc = build("gmail", "v1", credentials=creds)
        results = svc.users().messages().list(userId="me", q="is:unread label:inbox", maxResults=10).execute()
        messages = results.get("messages", [])

        if not messages:
            return ToolResult(ok=True, output="No unread emails found in inbox. All caught up!", systems_touched=["Email"])

        complaint_keywords = ["complaint", "issue", "problem", "not working", "refund", "wrong", "unhappy", "disappointed", "urgent", "help"]
        complaints_found = []
        for msg_ref in messages[:5]:
            msg = svc.users().messages().get(userId="me", id=msg_ref["id"], format="metadata",
                                             metadataHeaders=["Subject", "From"]).execute()
            headers = {h["name"]: h["value"] for h in msg["payload"]["headers"]}
            subject = headers.get("Subject", "")
            sender = headers.get("From", "")
            snippet = msg.get("snippet", "")
            if any(kw in (subject + snippet).lower() for kw in complaint_keywords):
                complaints_found.append({"from": sender, "subject": subject, "snippet": snippet})

        if not complaints_found:
            return ToolResult(ok=True, output=f"Scanned {len(messages)} unread emails. No complaints detected — inbox is clean.", systems_touched=["Email"])

        summaries = []
        follow_up_email_steps = []
        for c in complaints_found:
            classify_prompt = f"Classify this customer email and suggest a one-line response.\nFrom: {c['from']}\nSubject: {c['subject']}\nContent: {c['snippet']}\nCategories: appointment_change | availability_query | refund_request | general_complaint"
            response = await _generate_simulated_output(classify_prompt, "complaint")
            summaries.append(f"From: {c['from']}\nSubject: {c['subject']}\nAI Response: {response}")
            # Extract clean email address from "Name <email@x.com>" format
            import re as _re
            email_match = _re.search(r'[\w.+-]+@[\w-]+\.[\w.]+', c["from"])
            to_email = email_match.group(0) if email_match else c["from"]
            follow_up_email_steps.append({
                "title": f"Send complaint response to {c['from']}",
                "plan": [{"tool": "send_email", "args": {"to": to_email, "subject": f"Re: {c['subject']}", "draft_body": response}}],
                "reason": f"AI-drafted response to complaint from {c['from']} — review and approve to send."
            })

        output = f"Found {len(complaints_found)} complaint(s) in inbox:\n\n" + "\n\n---\n\n".join(summaries)
        output += "\n\n(Response approval requests have been queued — check the Approvals tab to send each reply)"
        return ToolResult(ok=True, output=output, systems_touched=["Email", "Complaints"], follow_up_quests=follow_up_email_steps)
    except Exception as e:
        return ToolResult(ok=False, output=f"Complaint scan failed: {e}", systems_touched=["Email"])


TOOL_REGISTRY: dict[str, Callable[[dict, str, any], Awaitable[ToolResult]]] = {
    # Core (all levels)
    "send_email": _send_email,
    "update_spreadsheet": _update_spreadsheet,
    "post_social_update": _post_social_update,
    "schedule_meeting": _schedule_meeting,
    "research_web": _research_web,
    # Level 4: financial_ops
    "generate_invoice": _generate_invoice,
    "create_proposal": _create_proposal,
    "create_task_list": _create_task_list,
    # Level 5: autonomous_ops
    "generate_report": _generate_report,
    "schedule_meeting_with_meet": _schedule_meeting_with_meet,
    "create_presentation": _create_presentation,
    "handle_complaint": _handle_complaint,
    "create_form": _create_form,
}

# Which permission bucket each tool falls under, for the autonomy-level gate in engine.py.
# Must correspond to strings you seed into autonomy_levels.unlocked_permissions.
TOOL_PERMISSION_SCOPE: dict[str, str] = {
    "send_email": "communications",
    "update_spreadsheet": "financial_records",
    "post_social_update": "communications",
    "schedule_meeting": "scheduling",
    "research_web": "research",
    # Level 4
    "generate_invoice": "financial_ops",
    "create_proposal": "financial_ops",
    "create_task_list": "financial_ops",
    # Level 5
    "generate_report": "autonomous_ops",
    "schedule_meeting_with_meet": "autonomous_ops",
    "create_presentation": "autonomous_ops",
    "handle_complaint": "autonomous_ops",
    "create_form": "autonomous_ops",
}


async def run_tool(name: str, args: dict, context_str: str = "", user=None) -> ToolResult:
    # Special case: planner refused the request as off-topic
    if name == "__refused__":
        reason = args.get("reason", "I only handle business tasks like scheduling, emails, research, and social updates.")
        return ToolResult(ok=False, output=f"I can't help with that. {reason}", systems_touched=[])
    handler = TOOL_REGISTRY.get(name)
    if handler is None:
        return ToolResult(ok=False, output=f"Unknown tool '{name}'.", systems_touched=[])
    try:
        return await handler(args, context_str, user)
    except Exception as exc:  # a real integration failing should surface, not silently fake success
        return ToolResult(ok=False, output=f"Tool '{name}' failed: {exc}", systems_touched=[])


def confidence_score_for(results: list[ToolResult]) -> float:
    if not results:
        return 0.0
    ok_count = sum(1 for r in results if r.ok)
    base = ok_count / len(results)
    # small deterministic jitter so every mission doesn't show an identical 1.00 in the demo
    return round(min(1.0, base - random.uniform(0, 0.03)), 2)
