import re

with open('server.ts', 'r') as f:
    text = f.read()

text = re.sub(r"error: 'Name, phone, email\s*\n\s*and instagram profile link are required.'", r"error: 'Name, phone, email, and instagram profile link are required.'", text)
with open('server.ts', 'w') as f:
    f.write(text)
