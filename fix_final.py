import re

with open('server.ts', 'r') as f:
    text = f.read()

text = re.sub(r'email\s*\n\s*password', r'email, password', text)
text = re.sub(r'email\s*\n\s*subject', r'email, subject', text)
text = re.sub(r'email\s*\n\s*message', r'email, message', text)
text = re.sub(r'email\s*\n\s*phone', r'email, phone', text)

with open('server.ts', 'w') as f:
    f.write(text)
