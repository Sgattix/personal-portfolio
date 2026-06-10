const sizes = {
  default: "lg:text-6xl text-3xl mb-8",
  sm: "lg:text-2xl text-lg",
};

function Header({
  title,
  subtitle,
  size = "default",
}: {
  title: string;
  subtitle: string;
  size?: "default" | "sm";
}) {
  return (
    <div>
      <p className="text-neutral-600 tracking-widest">{subtitle}</p>
      <h2 className={`font-bold text-white ${sizes[size]}`}>{title}</h2>
    </div>
  );
}

export default Header;
