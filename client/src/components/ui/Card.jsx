/**
 * Surface primitive — unifies the rounded-2xl/3xl and border-opacity drift.
 * `hover` adds the shared lift interaction; `padding` controls density.
 */
export default function Card({
  as: Tag = 'div',
  hover = false,
  padding = 'p-6',
  className = '',
  children,
  ...rest
}) {
  return (
    <Tag
      className={[
        'bg-white rounded-2xl border border-slate-200 shadow-card',
        hover && 'transition duration-200 cursor-pointer hover:shadow-lift hover:-translate-y-0.5 motion-reduce:hover:translate-y-0',
        padding,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  );
}
