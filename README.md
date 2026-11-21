# Xingchi Session Filter

A lightweight HTTP/HTTPS proxy that filters Codex session identifiers from requests. Built by [Nayumi.DEV](https://nayumi.dev).

## Features

- **Filters** Codex session IDs, thread IDs, and related headers from requests
- **Filters** Turn IDs, thread metadata, and client metadata from JSON request body
- **Two modes**: Standard filtering + Auto-rotate session IDs every 88 requests
- **Zero config** - Works out of the box with sensible defaults
- **Cross-platform** - Windows, Linux, macOS

## Download

| Platform | Download |
|----------|----------|
| Windows (x64) | [xingchi-session-filter-win.exe](dist/xingchi-session-filter-win.exe) |
| Linux (x64) | [xingchi-session-filter-linux](dist/xingchi-session-filter-linux) |
| macOS (x64) | [xingchi-session-filter-macos](dist/xingchi-session-filter-macos) |

## Quick Start

### Windows
```cmd
# Standard mode
xingchi-session-filter-win.exe

# Auto-rotate mode (new session ID every 88 requests)
set MODE=2 && xingchi-session-filter-win.exe
```

### Linux
```bash
# Standard mode
./xingchi-session-filter-linux

# Auto-rotate mode
MODE=2 ./xingchi-session-filter-linux

# Make executable first
chmod +x xingchi-session-filter-linux
```

### macOS
```bash
# Standard mode
./xingchi-session-filter-macos

# Auto-rotate mode
MODE=2 ./xingchi-session-filter-macos

# Make executable first
chmod +x xingchi-session-filter-macos
```

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `PORT` | `6969` | Local proxy port |
| `UPSTREAM_HOST` | `api.xingchiapi.com` | Upstream API host |
| `UPSTREAM_PROTOCOL` | `https` | Upstream protocol (http/https) |
| `UPSTREAM_PORT` | `443` (https) / `80` (http) | Upstream port |
| `MODE` | `1` | `1` = Standard, `2` = Auto-rotate |
| `FILTER_NAMES` | (empty) | Comma-separated extra header names to filter |

## Modes

### Mode 1: Standard (Default)
Filters session identifiers from requests and forwards to upstream. Session IDs pass through unchanged.

### Mode 2: Auto-Rotate
- Tracks request count per session ID
- When a session reaches **88 requests**, automatically generates a new random session ID
- Maintains a mapping chain: `original → replacement1 → replacement2 → ...`
- Each replacement also rotates after 88 requests
- All session-related headers (`x-session-id`, `session-id`, `codex-session-id`, etc.) are updated consistently

## Donate

If this tool helps you, consider sponsoring development:

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-Nayumi.DEV-ea4aaa?style=for-the-badge&logo=github-sponsors&logoColor=white)](https://github.com/sponsors/nayumiDEV)

**Direct link**: https://github.com/sponsors/nayumiDEV

## How It Works

```
Client → [Proxy:6969] → Filters Headers & Body → [Upstream:api.xingchiapi.com]
                    ↓
 Headers: x-session-id, session-id, thread-id, etc.
 Body:  thread_id, session_id, turn_id, client_metadata, etc.
```

### Filtered Headers
`x-session-id`, `session-id`, `thread-id`, `x-codex-*`, `x-openai-*`, etc.

### Filtered Body Fields
- Turn: `turn_id`, `parent_turn_id`, `root_turn_id`, `expected_turn_id`, `turn_trigger`, `tool_output`
- Thread: `thread_id`, `parent_thread_id`, `forked_from_id`, `attached_to_thread_id`, `project_id`
- Session: `session_id`, `installation_id`, `window_id`, `cli_version`, `originator`
- Metadata: `client_metadata`, `responsesapi_client_metadata`, `additional_context`, `environments`
- Config: `cwd`, `model`, `effort`, `summary`, `personality`, `approval_policy`, `sandbox_policy`, `permissions`, `output_schema`
- Status: `status`, `history_mode`, `model_provider`, `reasoning_effort`, `created_at`, `updated_at`, `recency_at`
- Experimental: `collaboration_mode`, `multi_agent_mode`, `cyber_access_program`, `disabled_plugin_ids`, `runtime_workspace_roots`, `approvals_reviewer`

## Building from Source

```bash
npm install
npm run build
```

Outputs to `dist/` with all three platforms.

## License

MIT © [Nayumi.DEV](https://nayumi.dev)