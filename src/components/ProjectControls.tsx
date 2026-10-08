"use client";
import {
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Select } from "@/components/ui/select";

function ProjectControls({
  selectedSort,
  selectedCategory,
  projects,
}: {
  selectedSort: string | undefined;
  selectedCategory: string | undefined;
  projects: { category: string }[];
}) {
  return (
    <>
      <Select
        defaultValue={selectedSort}
        onValueChange={(value) => {
          const params = new URLSearchParams(window.location.search);
          params.set("sort", value);
          window.location.search = params.toString();
        }}
      >
        <SelectTrigger className="bg-neutral-950 text-white border-0">
          {selectedSort || "Sort By"}
        </SelectTrigger>
        <SelectContent>
          {Object.keys(projects[0]).map((key) => (
            <SelectItem value={key} key={key}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        defaultValue={selectedCategory}
        onValueChange={(value) => {
          const params = new URLSearchParams(window.location.search);
          params.set("category", value);
          window.location.search = params.toString();
        }}
      >
        <SelectTrigger className="bg-neutral-950 text-white border-0">
          {selectedCategory || "All Categories"}
        </SelectTrigger>
        <SelectContent>
          {Array.from(new Set(projects.map((project) => project.category))).map(
            (category) => (
              <SelectItem value={category} key={category}>
                {category.charAt(0).toUpperCase() +
                  category.slice(1).replace(/-/g, " ")}
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>
      {selectedCategory || selectedSort ? (
        <button
          className="bg-neutral-950 text-white px-4 py-2 rounded-md border-0"
          onClick={() => {
            const params = new URLSearchParams(window.location.search);
            params.delete("category");
            params.delete("sort");
            window.location.search = params.toString();
          }}
        >
          Clear Filters
        </button>
      ) : null}
    </>
  );
}

export default ProjectControls;
