const fs = require('fs');
let code = fs.readFileSync('src/components/RewardsHub.tsx', 'utf8');
code = code.replace(/import \{ Ticket,/g, 'import {');
code = code.replace(/} from 'lucide-react';/, ', Ticket } from "lucide-react";');
fs.writeFileSync('src/components/RewardsHub.tsx', code);
