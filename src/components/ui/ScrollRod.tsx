export function ScrollRod() {
  return (
    <div className="relative z-10 mx-[-14px] h-4 rounded-full bg-[linear-gradient(180deg,#a8693a_0%,#7a4523_55%,#4f2b14_100%)] shadow-[0_3px_6px_rgba(40,20,10,0.45)]">
      <span className="absolute top-1/2 -left-1.5 size-5 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_35%,#f3d38a,#b8894f_60%,#7a5326)] shadow-sm" />
      <span className="absolute top-1/2 -right-1.5 size-5 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_35%,#f3d38a,#b8894f_60%,#7a5326)] shadow-sm" />
    </div>
  )
}
