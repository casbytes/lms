import React from "react";
import type { Reviews } from "~/utils/db.server";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { FaStar } from "react-icons/fa6";
import { Separator } from "../ui/separator";
import { format } from "date-fns";
import { capitalizeFirstLetter, safeParseDate } from "~/utils/helpers";
import { MetaCourse, MetaModule } from "~/services/sanity/types";

type ReviewsDialogProps = {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  item: MetaCourse | MetaModule;
};

export function ReviewsDialog({
  isDialogOpen,
  setIsDialogOpen,
  item,
}: ReviewsDialogProps) {
  function useTotalAndAverageRating(reviews: Reviews[]): {
    totalRating: number;
    averageRating: number;
  } {
    return React.useMemo(() => {
      const totalRating = reviews.reduce(
        (acc, review) => acc + review.rating,
        0
      );
      const averageRating =
        reviews.length > 0 ? totalRating / reviews.length : 0;
      return { totalRating, averageRating };
    }, [reviews]);
  }
  const { totalRating, averageRating } = useTotalAndAverageRating(
    item?.reviews?.length ? item.reviews : []
  );
  const reviewsLength = item.reviews ? item.reviews.length : 0;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{capitalizeFirstLetter(item.title)} reviews</DialogTitle>

          <div className="flex flex-col gap-1 pt-4">
            <div>
              <span className="text-slate-600">Total rating:</span>{" "}
              {totalRating}
            </div>
            <div>
              <span className="text-slate-600">Average rating:</span>{" "}
              {averageRating}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {item.reviews?.length ? (
              item.reviews.map((review, i) => (
                <div key={review.id} className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <span className="text-slate-600">Name:</span>{" "}
                    {review.user.name}
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-600">Rating:</span>{" "}
                    <Badge className="flex gap-1">
                      <FaStar />{" "}
                      <Separator
                        orientation="vertical"
                        className="mx-2 text-white"
                      />{" "}
                      {review.rating}
                    </Badge>
                  </div>
                  <DialogDescription>{review.description}</DialogDescription>
                  <div className="text-slate-700">
                    {format(safeParseDate(review.createdAt), "dd MMMM yyyy")}{" "}
                  </div>
                  {i < reviewsLength - 1 ? <Separator /> : null}
                </div>
              ))
            ) : (
              <div className="text-center font-mono mt-6 text-lg">
                No reviews yet
              </div>
            )}
          </div>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"outline"}>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
