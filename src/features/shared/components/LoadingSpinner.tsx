export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[hsl(280,100%,70%)]"></div>
    </div>
  );
}
