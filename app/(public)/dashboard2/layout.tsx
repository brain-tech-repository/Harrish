export default function Dashboard2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* You can wrap a sidebar, navbar, etc. here */}
      {children}
    </div>
  );
}
