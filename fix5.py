import re

with open('server.ts', 'r') as f:
    text = f.read()

# Replace all occurrences of "email\n\s*([a-zA-Z0-9_]+):" with "email,\n        \1:"
text = re.sub(r'email\s*\n\s*([a-zA-Z0-9_]+):', r'email,\n        \1:', text)

with open('server.ts', 'w') as f:
    f.write(text)
