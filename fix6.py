import re

with open('server.ts', 'r') as f:
    text = f.read()

text = text.replace('"Content-Type, Authorization, x-user-id, x-user-email"\n           x-user-name"', '"Content-Type, Authorization, x-user-id, x-user-email, x-user-name"')

with open('server.ts', 'w') as f:
    f.write(text)
