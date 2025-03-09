import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, MoreVertical, Pencil, Trash2 } from "lucide-react";

interface Cake {
  id: string;
  name: string;
  price: number;
  categories: string[];
  image: string;
}

interface CakeListProps {
  cakes: Cake[];
  isLoading: boolean;
  onDeleteCake: (id: string) => Promise<void>;
}

const CakeList = ({
  cakes = [],
  isLoading = false,
  onDeleteCake,
}: CakeListProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [cakeToDelete, setCakeToDelete] = useState<string | null>(null);

  const filteredCakes = cakes.filter((cake) =>
    cake.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = async () => {
    if (cakeToDelete) {
      await onDeleteCake(cakeToDelete);
      setCakeToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
        <div className="border rounded-md">
          <div className="p-4">
            <Skeleton className="h-8 w-full mb-4" />
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <Skeleton
                  key={`skeleton-row-${index}`}
                  className="h-16 w-full mb-2"
                />
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cakes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={() => navigate("/admin/cakes/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add New Cake
        </Button>
      </div>

      <div className="border rounded-md">
        {filteredCakes.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-lg font-medium mb-2">
              {searchQuery ? "No cakes found" : "No cakes added yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try a different search term or clear the search."
                : "Get started by adding your first cake listing."}
            </p>
            {!searchQuery && (
              <Button onClick={() => navigate("/admin/cakes/new")}>
                <Plus className="mr-2 h-4 w-4" /> Add New Cake
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead className="text-right w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCakes.map((cake) => (
                <TableRow key={cake.id}>
                  <TableCell>
                    <div className="h-12 w-12 rounded-md overflow-hidden">
                      <img
                        src={cake.image}
                        alt={cake.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{cake.name}</TableCell>
                  <TableCell>₱{cake.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {cake.categories.slice(0, 3).map((category, index) => (
                        <Badge
                          key={`${cake.id}-category-${index}`}
                          variant="secondary"
                          className="text-xs"
                        >
                          {category}
                        </Badge>
                      ))}
                      {cake.categories.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{cake.categories.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/admin/cakes/edit/${cake.id}`)
                          }
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setCakeToDelete(cake.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <AlertDialog
        open={!!cakeToDelete}
        onOpenChange={(open) => !open && setCakeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              cake listing and remove it from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CakeList;
