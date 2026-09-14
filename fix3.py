import re

with open('server.ts', 'r') as f:
    text = f.read()

text = re.sub(r'email\n\s*name\s*}', 'email, name }', text)
text = re.sub(r'email\n\s*name\)', 'email, name)', text)

with open('server.ts', 'w') as f:
    f.write(text)
