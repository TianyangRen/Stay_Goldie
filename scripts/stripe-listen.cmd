@echo off
setlocal
rem Local Stripe CLI (official zip in tools/stripe-cli). Bypasses Scoop shims if they fail on your PC.
set "ROOT=%~dp0.."
set "STRIPE_EXE=%ROOT%\tools\stripe-cli\stripe.exe"
if not exist "%STRIPE_EXE%" (
  echo Missing %STRIPE_EXE%. From repo root, run once in PowerShell:
  echo   see tools/stripe-cli download in README or ask the team.
  exit /b 1
)
"%STRIPE_EXE%" listen --forward-to "http://localhost:3000/api/stripe/webhook"
