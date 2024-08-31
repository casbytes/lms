import React from "react";
import { FaStar } from "react-icons/fa6";
import {
  Dialog,
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

export function AddReview() {
  const [rating, setRating] = React.useState(0);
  const [review, setReview] = React.useState("");
  const reviewsFetcher = useFetcher();
  return (
    <Dialog open>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="mb-4">Please review this module</DialogTitle>
          <div className="flex flex-col gap-4 mt-4">
            <div>
              <div>
                <span className="text-slate-600">Name:</span> Christopher Sesugh
              </div>
              <div>
                <span className="text-slate-600">Module:</span> Front end
                overview
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
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  id="review"
                  name="review"
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
          <Button variant={"outline"}>Close</Button>
          <Button
            onClick={() => {
              if (rating < 1 || review.length < 10) {
                toast({
                  title:
                    "Rating must be at least 1 and your review must be at least 10 characters long",
                });
              }
              reviewsFetcher.submit(
                { rating, review },
                { method: "POST", preventScrollReset: true }
              );
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
      {[...Array(5)].map((_, index) => {
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
