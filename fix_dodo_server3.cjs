const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Fix dodoClient initialization
code = code.replace(
  /const dodoClient = new DodoPayments\(\{[\s\n]*bearerToken: process\.env\.DODO_PAYMENTS_API_KEY \|\| ''[\s\n]*\}\);/,
  `const dodoClient = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY || '',
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT || 'test_mode'
});`
);

// Fix error logging in checkout
const oldCatch = `  } catch (error: any) {
    console.error("Dodo checkout error:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }`;

const newCatch = `  } catch (error: any) {
    console.error("Dodo checkout error details:", {
      status: error.status,
      message: error.message,
      dodoError: error.error,
      planId,
      env: process.env.DODO_PAYMENTS_ENVIRONMENT || 'test_mode'
    });
    res.status(500).json({ error: "Checkout could not be created. Please try again." });
  }`;

code = code.replace(oldCatch, newCatch);

fs.writeFileSync('server.ts', code, 'utf8');
