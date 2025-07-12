# Local Session Logging Features

## Overview
The Prism Perspective chat application now includes comprehensive local session logging functionality that tracks all conversations, models used, and perspectives generated. All data is stored locally in the browser's localStorage.

## Features Implemented

### 📊 Session Tracking
- **Automatic Session Management**: Each chat session is automatically tracked with a unique ID
- **Session Metadata**: Start time, end time, duration, and activity tracking
- **Message Counting**: Total messages, Prism interactions, and standard interactions
- **Model Usage**: Tracks which AI models were used in each session
- **Perspective Tracking**: Records all theoretical perspectives used in Prism mode

### 🗂️ Logging Service (`loggingService.js`)
- **Message Logging**: Every user message and AI response is logged with timestamps
- **Prism Analysis Tracking**: Full perspective details and synthesis are preserved
- **Session Analytics**: Comprehensive usage statistics and analytics
- **Data Export**: Export individual sessions as JSON files
- **Session Management**: Create, view, and delete sessions

### 📈 Logging Dashboard
Access via the "📊 History" button in the chat header.

#### Sessions Tab
- **Session List**: View all chat sessions with summaries
- **Session Details**: Detailed view of any selected session including:
  - Full conversation history
  - Metadata (duration, models used, perspectives)
  - Prism response breakdowns (perspectives + synthesis)
  - Message timestamps and interaction types

#### Analytics Tab
- **Usage Overview**: Total sessions, messages, and Prism usage rate
- **Interaction Statistics**: Breakdown of Prism vs standard interactions
- **Model Usage Charts**: Visual representation of model usage patterns
- **Perspective Analytics**: Most used theoretical perspectives
- **Top 10 Perspectives**: Charts showing perspective frequency

### 🔧 Integration Points

#### Chat Hook (`useChat.js`)
- Integrated logging into the `sendMessage` function
- Automatic session reset when clearing chat
- Tracks both standard and Prism interactions

#### Chat Component (`Chat.jsx`)
- Added "📊 History" button to access logging dashboard
- Maintains existing UI/UX while adding new functionality

### 💾 Data Structure

Each session contains:
```javascript
{
  id: "session_timestamp_random",
  startTime: "ISO timestamp",
  endTime: "ISO timestamp",
  messages: [
    {
      id: "message_id",
      timestamp: "ISO timestamp",
      userMessage: { role, content, timestamp },
      aiResponse: { 
        role, content, timestamp, model, 
        isPrism, perspectives, synthesis 
      },
      model: "model_name",
      isPrismMode: boolean
    }
  ],
  modelsUsed: ["model1", "model2"],
  perspectivesUsed: ["perspective1", "perspective2"],
  totalMessages: number,
  prismInteractions: number,
  regularInteractions: number
}
```

### 🎨 UI Components

#### SessionSummary Card
- Compact session overview with key metrics
- Quick actions: View, Export, Delete
- Visual indicators for Prism vs standard sessions
- Time-ago formatting for easy scanning

#### Dashboard Layout
- Responsive design for desktop and mobile
- Tabbed interface for Sessions and Analytics
- Detailed conversation replay with full context
- Export functionality for data portability

### 🔒 Privacy & Storage
- **Local Storage Only**: All data stays in the browser
- **No Server Communication**: Logging service is completely client-side
- **User Control**: Users can delete individual sessions or export their data
- **Automatic Cleanup**: Users have full control over their conversation history

### 📱 Mobile Responsive
- Dashboard adapts to mobile screens
- Touch-friendly interface
- Optimized session cards for smaller screens
- Preserved functionality across devices

## Usage

1. **Chat Normally**: All conversations are automatically logged
2. **View History**: Click "📊 History" button to open the dashboard
3. **Browse Sessions**: Click on any session card to view details
4. **Export Data**: Use the export button (📤) to download session data
5. **Manage Sessions**: Delete unwanted sessions with the delete button (🗑️)
6. **View Analytics**: Switch to Analytics tab for usage insights

## Technical Notes

- **Performance**: Efficient storage using localStorage with minimal memory footprint
- **Error Handling**: Graceful fallbacks if localStorage is unavailable
- **Data Integrity**: Validation and error recovery for corrupted data
- **Extensibility**: Modular design allows for easy feature additions

The logging system enhances the Prism Perspective experience by providing users with complete visibility into their conversations, perspective usage patterns, and interaction history while maintaining full privacy and control over their data.
