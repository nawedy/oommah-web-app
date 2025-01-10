import { Button } from '@/components/ui/button'

const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡']

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2 p-2">
      {emojis.map((emoji) => (
        <Button
          key={emoji}
          variant="ghost"
          className="text-2xl"
          onClick={() => onEmojiSelect(emoji)}
        >
          {emoji}
        </Button>
      ))}
    </div>
  )
}

