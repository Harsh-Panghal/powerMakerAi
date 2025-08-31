import { useChatStore } from '@/store/chatStore';

const responses: Record<string, string> = {
  'Add a boolean and a date field to the opportunity entity.': `Hello! Let's define your new entity attributes for the Opportunity entity...

First, the boolean attribute:

| Property | Value |
|----------|-------|
| Entity Name | Opportunity |
| Attribute Type | Boolean |
| Attribute Name | IsHighPriority |
| Display Name | High Priority |
| Description | Indicates if this opportunity requires immediate attention |
| Default Value | False |
| Required Field | No |

Now, let's define the date attribute:

| Property | Value |
|----------|-------|
| Entity Name | Opportunity |
| Attribute Type | Date and Time |
| Attribute Name | ExpectedClosureDate |
| Display Name | Expected Closure Date |
| Description | Anticipated date when the opportunity will be closed |
| Date Format | MM/DD/YYYY |
| Time Format | 12-hour |
| Required Field | Yes |

Once you confirm these specifications, I will generate the complete schema and provide implementation guidance for your CRM customization.`,

  'Create a custom entity to store API configuration details and suggest relevant columns.': `I'll help you create a custom API Configuration entity for your CRM system.

**Entity Details:**

| Property | Value |
|----------|-------|
| Entity Name | APIConfiguration |
| Display Name | API Configuration |
| Description | Stores third-party API integration settings |
| Primary Key | ConfigurationId (GUID) |

**Suggested Columns:**

| Column Name | Data Type | Description | Required |
|-------------|-----------|-------------|----------|
| ConfigurationName | Single Line Text | Friendly name for the API config | Yes |
| APIEndpoint | Single Line Text | Base URL for the API | Yes |
| APIKey | Single Line Text (Encrypted) | Authentication key | Yes |
| SecretKey | Single Line Text (Encrypted) | Secret for authentication | No |
| IsActive | Boolean | Enable/disable this configuration | Yes |
| APIProvider | Choice | Provider (Salesforce, HubSpot, Custom) | Yes |
| RateLimitPerMinute | Whole Number | API call limits | No |
| TimeoutSeconds | Whole Number | Request timeout setting | No |
| CreatedBy | User Lookup | Configuration creator | Yes |
| ModifiedOn | Date Time | Last update timestamp | Yes |

This structure provides secure storage for API credentials with proper access controls and audit trails.`,

  'I want to store 3rd party integration keys - create a config entity for that!': `Perfect! Let me create a secure Integration Keys configuration entity for your CRM.

**Entity: IntegrationKeys**

| Property | Value |
|----------|-------|
| Schema Name | new_integrationkeys |
| Display Name | Integration Keys |
| Description | Secure storage for third-party integration credentials |

**Security-First Column Design:**

| Column Name | Data Type | Security Level | Description |
|-------------|-----------|----------------|-------------|
| IntegrationName | Text | Standard | Service name (Stripe, PayPal, etc.) |
| PublicKey | Text | Standard | Public/Client ID |
| PrivateKey | Text | **Encrypted** | Secret key (field-level encryption) |
| APIToken | Text | **Encrypted** | Bearer/auth tokens |
| RefreshToken | Text | **Encrypted** | Token refresh credentials |
| Environment | Choice | Standard | Production, Sandbox, Test |
| IsActive | Boolean | Standard | Enable/disable integration |
| ExpiryDate | DateTime | Standard | Key expiration tracking |
| LastRotated | DateTime | Standard | Security audit trail |
| AllowedIPs | Text | Standard | IP whitelist (optional) |

**Security Features:**
- Field-level encryption for sensitive data
- Role-based access (System Admin only)
- Audit logging enabled
- No export permissions on encrypted fields

Ready to implement with enterprise-grade security standards!`,

  'Create a settings entity for storing SMTP details with column suggestions.': `I'll create a comprehensive SMTP Settings entity for your email configuration needs.

**Entity: SMTPSettings**

| Property | Value |
|----------|-------|
| Schema Name | new_smtpsettings |
| Display Name | SMTP Configuration |
| Description | Email server settings for system notifications |

**Column Specifications:**

| Column Name | Data Type | Max Length | Required | Description |
|-------------|-----------|------------|----------|-------------|
| ConfigurationName | Text | 100 | Yes | Friendly name (Primary Email, Backup Server) |
| SMTPServer | Text | 255 | Yes | Mail server hostname |
| Port | Number | - | Yes | SMTP port (25, 587, 465) |
| EnableSSL | Boolean | - | Yes | SSL encryption toggle |
| EnableTLS | Boolean | - | Yes | TLS encryption option |
| AuthenticationRequired | Boolean | - | Yes | Username/password required |
| Username | Text | 255 | No | SMTP authentication username |
| Password | Text (Encrypted) | 255 | No | SMTP password (encrypted storage) |
| FromAddress | Email | 255 | Yes | Default sender email |
| FromDisplayName | Text | 100 | No | Sender display name |
| ReplyToAddress | Email | 255 | No | Reply-to email address |
| MaxRecipientsPerEmail | Number | - | No | Batch sending limit |
| ConnectionTimeout | Number | - | No | Timeout in seconds |
| IsDefault | Boolean | - | Yes | Primary SMTP configuration |
| IsActive | Boolean | - | Yes | Enable/disable this config |
| TestEmailSent | DateTime | - | No | Last test email timestamp |

**Additional Features:**
- Email template integration ready
- Bounce handling support
- Delivery tracking capabilities

This configuration supports multiple SMTP providers and ensures reliable email delivery for your CRM communications.`
};

export const simulateTyping = async (
  text: string,
  onUpdate: (content: string) => void,
  onComplete: () => void
): Promise<void> => {
  const words = text.split(' ');
  let currentText = '';
  
  for (let i = 0; i < words.length; i++) {
    currentText += (i > 0 ? ' ' : '') + words[i];
    onUpdate(currentText);
    
    // Random delay between words to simulate typing
    const delay = Math.random() * 100 + 30;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  onComplete();
};

export const getAIResponse = (prompt: string): string => {
  // Check for exact matches first
  if (responses[prompt]) {
    return responses[prompt];
  }
  
  // Check for partial matches or keywords
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('boolean') && lowerPrompt.includes('date') && lowerPrompt.includes('opportunity')) {
    return responses['Add a boolean and a date field to the opportunity entity.'];
  }
  
  if (lowerPrompt.includes('api') && lowerPrompt.includes('configuration')) {
    return responses['Create a custom entity to store API configuration details and suggest relevant columns.'];
  }
  
  if (lowerPrompt.includes('integration') && lowerPrompt.includes('key')) {
    return responses['I want to store 3rd party integration keys - create a config entity for that!'];
  }
  
  if (lowerPrompt.includes('smtp') && lowerPrompt.includes('settings')) {
    return responses['Create a settings entity for storing SMTP details with column suggestions.'];
  }
  
  // Default response for unmatched prompts
  return `I understand you're looking for CRM customization assistance. Let me help you with that.

For the request: "${prompt}"

I can help you create custom entities, configure fields, set up integrations, or modify existing CRM components. Here are some suggestions:

**Entity Design Options:**
- Custom fields with appropriate data types
- Relationship mappings between entities  
- Security roles and field-level permissions
- Workflow automation triggers

**Integration Capabilities:**
- API endpoint configurations
- Authentication setup
- Data synchronization rules
- Error handling procedures

Would you like me to elaborate on any of these areas or provide specific implementation details for your CRM customization needs?`;
};

export const startStreamingResponse = (prompt: string): void => {
  const { updateStreamingMessage, finishStreaming } = useChatStore.getState();
  const response = getAIResponse(prompt);
  
  // Start streaming after a brief delay
  setTimeout(() => {
    simulateTyping(
      response,
      (content) => updateStreamingMessage(content),
      () => finishStreaming()
    );
  }, 300);
};