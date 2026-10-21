export default function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="card mx-auto flex max-w-xl flex-col items-center gap-3 px-6 py-14 text-center">
      {Icon && <Icon className="h-14 w-14 text-[#c8cdcd]" aria-hidden="true" />}
      <h2 className="text-2xl font-medium">{title}</h2>
      {children && <p className="max-w-md text-sm text-[#565959]">{children}</p>}
      {action}
    </div>
  );
}
