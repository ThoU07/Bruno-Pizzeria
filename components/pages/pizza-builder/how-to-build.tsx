"use client";

import { Play } from "lucide-react";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";

export default function HowToBuild() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full gap-2">
          <Play className="h-4 w-4" />
          How to Build
        </Button>
      </DialogTrigger>
      <DialogContent className="md:min-w-[60vw]">
        <DialogTitle>How to Build a Pizza</DialogTitle>
        <DialogDescription>
          Check out this video to learn how to build a pizza
        </DialogDescription>
        <div className="w-full max-h-[80vh]">
          <iframe
            className="w-full aspect-video"
            src="https://www.youtube.com/embed/kpd1WLpXamw?si=S9AEwV78SFCWxBto"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
}
