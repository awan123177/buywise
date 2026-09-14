import re

with open('server.ts', 'r') as f:
    text = f.read()

text = re.sub(r'email\s*\n\s*name, Number', r'email, name, Number', text)
text = re.sub(r'email\s*\n\s*contact:', r'email, contact:', text)
text = re.sub(r'email\s*\n\s*instagram', r'email, instagram', text)

with open('server.ts', 'w') as f:
    f.write(text)
