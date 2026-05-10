# Project Plan

## 1. Project Goal

Build a WhatsApp voice bot in Node.js that can:

- Receive WhatsApp messages and voice notes
- Transcribe incoming audio to text
- Process the text through bot logic
- Reply with synthesized voice
- Be deployed and operated on Azure

## 2. Development Plan

### Phase 1: Foundations

- Set up the Node.js project structure
- Add configuration handling for environment variables
- Choose the WhatsApp integration approach, using `whatsapp-web.js`
- Define the message flow for text and voice messages
- Select STT and TTS providers for the first version

### Phase 2: WhatsApp Integration

- Connect the bot to WhatsApp Web
- Handle login and session persistence
- Listen for incoming messages and detect audio messages
- Download and store incoming audio temporarily for processing
- Add basic error handling and retry logic

### Phase 3: Speech Processing

- Convert WhatsApp voice formats to a format supported by the STT service
- Transcribe audio into text
- Send the transcript to the bot logic
- Generate the response text
- If needed, synthesize audio for voice replies

### Phase 4: Bot Logic

- Implement a simple command and intent layer
- Add conversation handling for common user flows
- Support both short text replies and voice replies
- Log message processing results for debugging

### Phase 5: Hardening

- Add validation for file types, sizes, and message formats
- Handle timeouts and failed transcription or synthesis requests
- Protect secrets and API keys
- Add structured logging and basic observability

## 3. Azure Publishing Plan

### Recommended Azure Hosting

- Use Azure Container Apps or Azure App Service for the Node.js runtime
- Prefer a container-based deployment if Chromium or session persistence becomes important
- Keep the bot process running continuously so the WhatsApp session stays active

### Azure Services to Use

- Azure Container Registry for container images if using containers
- Azure Key Vault for secrets such as API keys, session credentials, and webhook tokens
- Azure Blob Storage for temporary audio artifacts or persistent bot files if needed
- Azure Application Insights for logs, metrics, and error tracking

### Deployment Steps

- Containerize the application with a production-ready Node.js image
- Configure environment variables for WhatsApp, STT, and TTS services
- Provision the Azure resources needed for hosting, storage, and secrets
- Deploy the app to Azure and verify the WhatsApp session initializes correctly
- Test voice message processing end to end in the Azure environment
- Set up CI/CD so changes can be deployed automatically from the main branch

### Operational Considerations

- Confirm the hosting plan supports long-running processes and outbound network access
- Make sure the bot can recover after restarts without losing the WhatsApp session
- Decide where session data will live and how it will be restored
- Add alerts for repeated auth failures, transcription failures, and process restarts

## 4. Delivery Milestones

### Milestone 1

- Project skeleton in place
- WhatsApp connection working locally
- Basic text reply working

### Milestone 2

- Voice note transcription working
- TTS reply support working
- Core bot flow validated locally

### Milestone 3

- Azure deployment completed
- Secrets and storage configured
- Monitoring enabled
- End-to-end voice bot verified in Azure

## 5. Final Checklist

- Local development works reliably
- Voice notes are handled correctly
- Secrets are not stored in source control
- Azure deployment is repeatable
- Logging and monitoring are enabled
- Bot survives redeployments and restarts
