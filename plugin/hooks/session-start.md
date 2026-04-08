---
event: SessionStart
---

Check if the `clickup` CLI is available. If not, inform the user how to install it:

```bash
# Linux (x64)
curl -L https://github.com/TakashiAihara/clickup-cli/releases/latest/download/clickup-linux-x64 -o /usr/local/bin/clickup && chmod +x /usr/local/bin/clickup

# macOS (Apple Silicon)
curl -L https://github.com/TakashiAihara/clickup-cli/releases/latest/download/clickup-darwin-arm64 -o /usr/local/bin/clickup && chmod +x /usr/local/bin/clickup

# macOS (Intel)
curl -L https://github.com/TakashiAihara/clickup-cli/releases/latest/download/clickup-darwin-x64 -o /usr/local/bin/clickup && chmod +x /usr/local/bin/clickup
```

Then authenticate with `clickup auth login`.
