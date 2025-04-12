// Custom styles that can be added inline to override card styling 
// without modifying the globals.css file

export const cardOverrides = {
  eventCard: "!bg-gray-800 !border-gray-700 !text-white hover:!border-gray-500",
  eventCardTitle: "!text-white !font-serif",
  eventCardText: "!text-gray-300",
  eventCardMeta: "!text-gray-400",
  eventCardButton: "!bg-gray-900 !text-white hover:!bg-gray-700",
  
  albumCard: "!bg-gray-800 !border-gray-700 !text-white hover:!border-gray-500", 
  albumCardTitle: "!text-white !font-serif",
  albumCardText: "!text-gray-300",
  albumCardMeta: "!text-gray-400",
  
  videoCard: "!bg-gray-800 !border-gray-700 !text-white hover:!border-gray-500",
  videoCardTitle: "!text-white !font-serif", 
  videoCardText: "!text-gray-300",
  videoCardMeta: "!text-gray-400"
}

// Feature card override to ensure transparency
export const featureCardOverride = {
  card: "bg-transparent backdrop-blur-sm border border-white/20 text-white hover:bg-white/10",
  iconContainer: "bg-black/40",
  icon: "text-white",
  title: "text-white",
  text: "text-gray-300"
}

// Add custom button overrides
export const buttonOverrides = {
  programBtnPrimary: "bg-white text-black hover:bg-transparent hover:text-white border-white transition-colors",
  programBtnSecondary: "bg-white text-black hover:bg-black hover:text-white border-white transition-colors"
}
