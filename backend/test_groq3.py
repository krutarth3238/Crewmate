import asyncio
from groq import AsyncGroq

async def main():
    client = AsyncGroq(api_key='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')
    try:
        models = await client.models.list()
        print('SUCCESS:', [m.id for m in models.data])
    except Exception as e:
        print('ERROR:', str(e))

asyncio.run(main())
