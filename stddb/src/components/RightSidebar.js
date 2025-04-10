// src/components/RightSidebar.js
import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper'; // Use Paper for background/elevation
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip'; // *** Added import ***

// Icons
import ForumIcon from '@mui/icons-material/Forum'; // Chat icon
import CloseIcon from '@mui/icons-material/Close'; // Close/Collapse icon
import SendIcon from '@mui/icons-material/Send'; // Send icon
import PersonIcon from '@mui/icons-material/Person'; // Fallback avatar

import './RightSidebar.css'; // We will update this CSS

// Demo Chat Messages (Replace with real data/state later)
const demoMessages = [
  { id: 1, user: "Alice", text: "Hey everyone! Working on the database schema.", time: "10:31 AM", avatarSeed: "A" },
  { id: 2, user: "Bob", text: "Sounds good, Alice. I'm focusing on the API routes.", time: "10:33 AM", avatarSeed: "B" },
  { id: 3, user: "Charlie", text: "Anyone know where the latest UI mockups are?", time: "10:35 AM", avatarSeed: "C" },
  { id: 4, user: "Alice", text: "Check the shared drive > 'Design Files' folder.", time: "10:36 AM", avatarSeed: "A" },
  { id: 5, user: "David", text: "Just joined! What's the main topic?", time: "10:40 AM", avatarSeed: "D"},
];

const RightSidebar = () => {
  // State for controlling visibility (expanded/collapsed)
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded
  const chatBodyRef = useRef(null); // Ref to scroll chat to bottom

  // Scroll to bottom when new messages might appear (or on load)
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [/* Dependency array: Add state variable holding messages when implemented */]);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  // Helper to generate simple avatar background colors based on seed
  const stringToColor = (string) => {
    let hash = 0;
    let i;
    if (!string || string.length === 0) return '#bdbdbd'; // Fallback color for empty string
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  }

  return (
    // Use Paper for consistent background and elevation control
    // Add dynamic class based on state
    <Paper
        component="aside"
        elevation={0} // Use border instead of shadow if preferred
        square // Remove rounded corners if desired
        className={`right-sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}
        aria-label="Public Chat Area"
        sx={{ borderLeft: 1, borderColor: 'divider' }} // Use MUI border styling
    >
        {/* Header Area */}
        <Box className="sidebar-header">
            {/* Show title only when expanded */}
            {isExpanded && (
                <Typography variant="subtitle1" component="h3" className="sidebar-title">
                    <ForumIcon sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: '1.1rem' }} />
                    Public Chat
                </Typography>
            )}
            {/* Always show toggle button */}
            {/* *** Tooltip is used here *** */}
            <Tooltip title={isExpanded ? "Collapse Chat" : "Expand Chat"} placement="left">
                <IconButton onClick={toggleSidebar} size="small" aria-label={isExpanded ? "Collapse Chat" : "Expand Chat"}>
                     {/* Change icon based on state - using Close for collapse */}
                    {isExpanded ? <CloseIcon fontSize="small"/> : <ForumIcon fontSize="small"/>}
                </IconButton>
            </Tooltip>
        </Box>

        {/* Divider */}
        <Divider />

        {/* Content Area - only rendered when expanded */}
        {isExpanded && (
            <Box className="sidebar-content-wrapper">
                {/* Chat Message List */}
                <Box className="chat-body" ref={chatBodyRef}>
                    <List dense sx={{ width: '100%', pt: 1 }}>
                        {demoMessages.map((msg) => (
                            <ListItem key={msg.id} alignItems="flex-start" className="chat-message">
                                <ListItemAvatar sx={{ minWidth: 40 }}>
                                    <Avatar
                                        sx={{ width: 28, height: 28, bgcolor: stringToColor(msg.user), fontSize: '0.8rem' }}
                                        alt={msg.user}
                                    >
                                        {msg.avatarSeed || <PersonIcon />}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="caption" component="span" sx={{ fontWeight: 'bold', color: 'text.primary', mr: 0.5 }}>
                                            {msg.user}
                                        </Typography>
                                    }
                                    secondary={
                                        <>
                                            <Typography component="span" variant="body2" color="text.primary" sx={{ display: 'block' }}>
                                                {msg.text}
                                            </Typography>
                                            <Typography component="span" variant="caption" color="text.secondary">
                                                {msg.time}
                                            </Typography>
                                        </>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>

                {/* Chat Input Area */}
                <Box className="chat-input-area">
                    <Divider />
                    <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Type your message..."
                        // Add state and onChange handler later
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                <IconButton edge="end" color="primary" size="small" aria-label="Send message">
                                    <SendIcon fontSize='small'/>
                                </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{ p: 1 }} // Padding around text field container
                    />
                </Box>
            </Box>
        )}
    </Paper>
  );
};

export default RightSidebar;