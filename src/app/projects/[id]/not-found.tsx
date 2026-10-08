export default function NotFound() {
  return (
    <div className="flex w-full h-screen justify-center items-center flex-col">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-lg uppercase tracking-widest">
        Sorry, this project doesn&apos;t exist :/
      </p>
      <p className="text-sm text-muted-foreground uppercase tracking-widest">
        Or maybe it got eaten by someone
      </p>
    </div>
  );
}
