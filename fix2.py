import re

with open('server.ts', 'r') as f:
    text = f.read()

text = text.replace('email,', 'email')

with open('server.ts', 'w') as f:
    f.write(text)
