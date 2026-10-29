import type { BusinessAddressBundle } from '@/lib/business';
import { buildWhatsAppWaMeUrl } from '@/lib/business';

interface BusinessLocationsProps {
  address: BusinessAddressBundle;
  className?: string;
  showLegalName?: boolean;
  showPhones?: boolean;
}

export function BusinessLocations({
  address,
  className = '',
  showLegalName = true,
  showPhones = true,
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
          {showPhones ? (
            <p className="mt-1.5">
              <a
                href={buildWhatsAppWaMeUrl(location.phoneWhatsApp)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent underline-offset-2 hover:underline"
              >
                WhatsApp / Tel · {location.phoneDisplay}
              </a>
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
