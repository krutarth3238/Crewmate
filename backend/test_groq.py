import asyncio
from groq import AsyncGroq

async def main():
    client = AsyncGroq(api_key='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')
    try:
        resp = await client.chat.completions.create(model='llama-3.3-70b-versatile', messages=[{'role':'user','content':'hi'}])
        print('SUCCESS:', resp.choices[0].message.content)
    except Exception as e:
        print('ERROR:', str(e))

asyncio.run(main())
