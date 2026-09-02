const SIZES = { xs: 'h-4 w-4', sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };

/** Loading ring — inherits currentColor so it works on any surface. */
export default function Spinner({ size = 'md', className = '' }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full shrink-0 ${SIZES[size] || SIZES.md} ${className}`}
      style={{
        borderWidth: size === 'lg' ? 4 : 3,
        borderStyle: 'solid',
        borderColor: 'color-mix(in srgb, currentColor 25%, transparent)',
        borderTopColor: 'currentColor',
      }}
    />
  );
}
