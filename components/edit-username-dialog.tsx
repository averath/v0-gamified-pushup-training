"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface EditUsernameDialogProps {
  currentUsername: string
  onUsernameUpdate: (newUsername: string) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function EditUsernameDialog({
  currentUsername,
  onUsernameUpdate,
  open: controlledOpen,
  onOpenChange,
}: EditUsernameDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [username, setUsername] = useState(currentUsername)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClient()

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!username.trim()) {
      setError("Username cannot be empty")
      return
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters")
      return
    }

    if (username.length > 20) {
      setError("Username must be less than 20 characters")
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username can only contain letters, numbers, and underscores")
      return
    }

    if (username === currentUsername) {
      setOpen(false)
      return
    }

    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error: updateError } = await supabase.from("profiles").update({ username }).eq("id", user.id)

      if (updateError) {
        if (updateError.code === "23505") {
          setError("Username already taken")
        } else {
          setError("Failed to update username")
        }
        return
      }

      onUsernameUpdate(username)
      setOpen(false)
    } catch (err) {
      console.error("Error updating username:", err)
      setError("Failed to update username")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
            <Pencil className="h-3 w-3" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Change Username</DialogTitle>
            <DialogDescription>Update your display name. This will be visible to other users.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter new username"
                disabled={isLoading}
                autoComplete="off"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
