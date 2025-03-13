export const CONNECTION_ERROR: string = "connection_error";

export const RESET: string = "reset";

// export const REGISTER_USER_SUCCESS:string = "register_user_success";

export const BIO_LISTS = [
  "Hey there! I'm using Goss-up to stay connected.",
  "Exploring the world one chat at a time.",
  "Here to connect and make new friends!",
  "Always ready for a good conversation.",
  "Living life one message at a time.",
  "Chillin' and chatting, come say hi!",
  "Let's chat and make some memories.",
  "Just here to vibe and have a good time.",
  "Coffee lover ☕, let's chat over a virtual cup!",
  "Dreamer, thinker, and ready to chat."
];

export const SPECIAL_VALUE_WHEN_USER_NULL = "special-value-when-user-is-null";

export const SOCKET_EVENTS = {
  JOIN_ROOM: "join_room",
  LEAVE_ROOM: "leave_room",
  SEND_MESSAGE: "send_message",
  NEW_MESSAGE: "new_message",
  USER_TYPING: "user_typing",
  USER_STOP_TYPING: "user_stop_typing",
  MESSAGE_STATUS_UPDATE: "message_status_update",
  // MESSAGE_STATUS_UPDATE_BULK: "message_status_update_bulk",

  CHAT_NAME_ICON_UPDATE: "chat_name_icon_update",
  TOGGLE_ADMIN: "toggle_admin",
  REMOVED_PARTICIPANT: "removed_participant",
  CREATE_OR_ADD_PARTICIPANTS: "create_or_add_participants",
  LEAVE_GROUP: "leave_group",


  USER_ONLINE: "user_online",
  USER_OFFLINE: "user_offline",
  USER_JOINED: "user_joined",
  USER_LEFT: "user_left",
} as const;