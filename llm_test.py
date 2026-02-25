def call_minimax():
    from openai import OpenAI
    client = OpenAI(
      base_url = "https://integrate.api.nvidia.com/v1",
      api_key = "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"
    )
    completion = client.chat.completions.create(
      model="minimaxai/minimax-m2.1",
      messages=[{"role":"user","content":""}],
      temperature=1,
      top_p=0.95,
      max_tokens=8192,
      stream=True
    )
    for chunk in completion:
      if not getattr(chunk, "choices", None):
        continue
      if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")