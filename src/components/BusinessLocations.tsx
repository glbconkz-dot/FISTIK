import type { BusinessAddressBundle } from '@/lib/business';

interface BusinessLocationsProps {
  address: BusinessAddressBundle;
  className?: string;
  showLegalName?: boolean;
}

export function BusinessLocations({
  address,
  className = '',
  showLegalName = true,
}: BusinessLocationsProps) {
  return (
    <div className={`space-y-5 ${className}`}>
      {showLegalName ? <p className="font-medium">{address.legalName}</p> : null}
      {address.locations.map((location) => (
        <div key={location.key}>
          <p className="text-sm font-semibold text-foreground">{location.label}</p>
          {location.lines.map((line) => (
            <p key={line} className="text-muted">
              {line}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
