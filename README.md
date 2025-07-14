## **Chating Mousie** 

This is a **real-time collaborative chat application** with a unique twist: instead of traditional chat rooms, users can see each other's messages positioned at their mouse cursor locations on the screen.

### **What Does It Do?**

The application creates a dynamic, mouse-following chat experience where:
- Users type messages that appear at their mouse cursor position
- Other users see these messages floating at the sender's mouse location in real-time
- Each user gets a unique ID and random color for identification
- Messages follow users' mouse movements across the screen
- The chat data auto-clears every minute to keep conversations fresh

### **Technical Architecture**

**Backend (`src/app.ts`):**
- **WebSocket Server**: Handles real-time communication between clients
- **HTTP Server**: Serves static frontend files from the `dist/frontend` directory
- **In-memory Database**: Simple object that stores user data (messages, positions, colors)
- **Cron Job**: Clears the database every minute using `node-cron`
- **Static File Serving**: Handles various file types with proper MIME types

**Frontend (`dist/frontend/`):**
- **HTML**: Simple interface with a single input field
- **JavaScript**: Handles WebSocket connections, mouse tracking, and dynamic message rendering
- **CSS**: Styles the floating chat containers and input field

### **Key Features**

1. **Real-time Communication**: Uses WebSocket for instant message broadcasting
2. **Mouse Position Tracking**: Messages appear where users' cursors are located
3. **Dynamic User Identification**: Each user gets a unique UUID and random color
4. **Spatial Chat Experience**: Messages are positioned absolutely on the screen
5. **Auto-cleanup**: Database clears every minute to prevent data buildup
6. **Responsive Design**: Messages have max-width constraints and proper word wrapping

### **How It Works**

1. User connects → Gets unique ID and color stored in localStorage
2. User types/moves mouse → Data sent via WebSocket to server
3. Server broadcasts user data to all other connected clients
4. Other users see messages positioned at sender's mouse location
5. Database auto-clears every minute for fresh conversations

This is a creative take on chat applications, creating a **shared spatial environment** where conversations happen based on mouse movements rather than traditional message threads.

To start this project on local

1. clone the repo
2. run `npm install`
3. run `tsc`
4. run `node ./dist/app.js`

Frontend code is in default dist/Frontend folder folder.

## Deployed Link:

https://chating-mousie.up.railway.app/

## Example:

https://github.com/user-attachments/assets/a61f3757-9d84-4cfc-9f9c-7fea639ef590




