import React from "react";
import { FaStar } from "react-icons/fa6";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { cn } from "~/libs/shadcn";
import { useFetcher } from "@remix-run/react";
import { toast } from "./ui/use-toast";
import type { Course, Module, User } from "~/utils/db.server";

export function AddReview({
  user,
  course,
  module,
  isDialogOpen,
  setIsDialogOpen,
}: {
  user: User;
  course?: Course;
  module?: Module;
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
}) {
  const [rating, setRating] = React.useState(0);
  const [description, setDescription] = React.useState("");
  const reviewsFetcher = useFetcher();
  const item = course ?? (module as Module);
  const itemType = course ? "course" : "module";
  const reviewRes = reviewsFetcher.data as {
    error: boolean;
    message: string;
    success: boolean;
  };

  React.useEffect(() => {
    if (reviewRes) {
      if (reviewRes?.error) {
        toast({
          title: reviewRes.message,
          variant: "destructive",
        });
      } else if (reviewRes?.success) {
        toast({
          title: reviewRes.message,
        });
      }
    }
  }, [reviewRes]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="mb-4">Please review this module</DialogTitle>
          <div className="flex flex-col gap-4 mt-4">
            <div>
              <div>
                <span className="text-slate-600">Name:</span> {user.name}
              </div>
              <div>
                <span className="text-slate-600">
                  {course ? "Course" : "Module"}:
                </span>{" "}
                {item.title}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex gap-2 items-center">
                <Label htmlFor="rating">Rating:</Label>
                <StarRating rating={rating} setRating={setRating} />
              </div>
              <div>
                <Label htmlFor="review">Review:</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  id="review"
                  name="description"
                  required
                  minLength={10}
                  rows={5}
                  placeholder="Your review here..."
                />
              </div>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>
            <Button variant={"outline"}>Remind me later</Button>
          </DialogClose>
          <Button
            name="intent"
            value="review"
            onClick={() => {
              if (rating < 1 || description.length < 10) {
                toast({
                  title:
                    "Rating must be at least 1 and your review must be at least 10 characters long",
                });
              } else {
                reviewsFetcher.submit(
                  {
                    rating,
                    description,
                    itemTitle: item.title,
                    itemType,
                    intent: "review",
                  },
                  { method: "POST", preventScrollReset: true }
                );
              }
            }}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type StarRatingProps = {
  rating: number;
  setRating: (rating: number) => void;
};

function StarRating({ rating, setRating }: StarRatingProps) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        return (
          <FaStar
            key={index}
            size={24}
            id="rating"
            name="rating"
            className={cn("cursor-pointer", {
              "text-yellow-400": starValue <= rating,
              "text-gray-300": starValue > rating,
            })}
            onClick={() => setRating(starValue)}
          />
        );
      })}
    </div>
  );
}
