import { formatCurrency } from '../lib/formatters';

const PRIME_CATEGORIES = new Set(['VIP', 'PREMIUM']);

function resolveSection(seat) {
  const category = String(seat?.seatCategory || '').toUpperCase();
  return PRIME_CATEGORIES.has(category) ? 'PRIME' : 'CLASSIC';
}

function buildSeatNumberRanges(maxSeatNumber) {
  if (!Number.isFinite(maxSeatNumber) || maxSeatNumber <= 0) {
    return [];
  }

  if (maxSeatNumber <= 10) {
    return [{ start: 1, end: maxSeatNumber }];
  }

  const sideBlockSize = maxSeatNumber >= 18 ? 4 : 3;
  const leftEnd = sideBlockSize;
  const rightStart = Math.max(leftEnd + 2, maxSeatNumber - sideBlockSize + 1);

  return [
    { start: 1, end: leftEnd },
    { start: leftEnd + 1, end: rightStart - 1 },
    { start: rightStart, end: maxSeatNumber },
  ].filter((range) => range.start <= range.end);
}

function buildSections(seats) {
  const groupedBySection = seats.reduce(
    (accumulator, seat) => {
      const section = resolveSection(seat);
      accumulator[section].push(seat);
      return accumulator;
    },
    { PRIME: [], CLASSIC: [] },
  );

  return ['PRIME', 'CLASSIC']
    .map((sectionKey) => {
      const sectionSeats = groupedBySection[sectionKey];
      if (!sectionSeats.length) {
        return null;
      }

      const rows = sectionSeats.reduce((accumulator, seat) => {
        const next = { ...accumulator };
        if (!next[seat.seatRow]) {
          next[seat.seatRow] = [];
        }
        next[seat.seatRow].push(seat);
        return next;
      }, {});

      const orderedRows = Object.entries(rows).sort(([left], [right]) => left.localeCompare(right));
      const uniquePrices = [...new Set(sectionSeats.map((seat) => Number(seat.price || 0)))].sort((left, right) => left - right);
      const priceLabel =
        uniquePrices.length <= 1
          ? formatCurrency(uniquePrices[0] || 0)
          : `${formatCurrency(uniquePrices[0])} - ${formatCurrency(uniquePrices[uniquePrices.length - 1])}`;

      return {
        key: sectionKey,
        priceLabel,
        orderedRows,
      };
    })
    .filter(Boolean);
}

function SeatButton({ seat, clientSessionId, onSeatClick, disabled }) {
  const isMine = seat.status === 'SELECTED' && seat.selectedBySessionId === clientSessionId;
  const isHeld = seat.status === 'SELECTED' && seat.selectedBySessionId !== clientSessionId;
  const isBooked = seat.status === 'BOOKED';
  const isUnavailable = isHeld || isBooked;
  const isDisabled = disabled || isUnavailable;
  const seatNumberLabel = String(seat.seatNumber || '').padStart(2, '0');

  let classes = 'border-emerald-500 bg-white text-slate-700 hover:border-emerald-600 hover:bg-emerald-50';
  if (isMine) {
    classes = 'border-amber-300 bg-amber-100 text-amber-900';
  } else if (isUnavailable) {
    classes = 'border-slate-300 bg-slate-200 text-slate-400';
  }

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => onSeatClick(seat)}
      aria-label={`Seat ${seat.label}`}
      className={`seat-transition h-10 rounded-lg border text-xs font-semibold sm:h-11 sm:text-sm ${classes} ${
        isDisabled ? 'cursor-not-allowed opacity-90' : ''
      }`}
    >
      {seatNumberLabel}
    </button>
  );
}

export function SeatGrid({ seats, clientSessionId, onSeatClick, disabled }) {
  if (!seats.length) {
    return (
      <div className="glass-card p-6 text-center text-slate-400">
        Seat layout is not available for this showtime.
      </div>
    );
  }

  const maxSeatNumber = seats.reduce((highest, seat) => Math.max(highest, Number(seat.seatNumber || 0)), 0);
  const seatRanges = buildSeatNumberRanges(maxSeatNumber);
  const sections = buildSections(seats);

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-300/60 bg-slate-100/95 p-4 text-slate-700 sm:p-6">
      <div className="space-y-6">
        {sections.map((section, sectionIndex) => (
          <div
            key={section.key}
            className={sectionIndex === 0 ? '' : 'border-t border-slate-300/80 pt-6'}
          >
            <p className="text-center text-xl font-semibold tracking-wide text-slate-800">
              {section.priceLabel} {section.key}
            </p>

            <div className="mt-4 space-y-3">
              {section.orderedRows.map(([rowLabel, rowSeats]) => {
                const rowSeatLookup = new Map(rowSeats.map((seat) => [seat.seatNumber, seat]));

                return (
                  <div key={rowLabel} className="flex items-center gap-3">
                    <div className="w-7 text-xs font-semibold text-slate-500">{rowLabel}</div>
                    <div className="flex flex-1 items-center gap-4 sm:gap-6">
                      {seatRanges.map((range) => {
                        const numbersInRange = Array.from(
                          { length: range.end - range.start + 1 },
                          (_, offset) => range.start + offset,
                        );

                        return (
                          <div
                            key={`${rowLabel}-${range.start}-${range.end}`}
                            className="grid flex-1 gap-2"
                            style={{ gridTemplateColumns: `repeat(${numbersInRange.length}, minmax(0, 1fr))` }}
                          >
                            {numbersInRange.map((seatNumber) => {
                              const seat = rowSeatLookup.get(seatNumber);
                              if (!seat) {
                                return <span key={`${rowLabel}-${seatNumber}`} className="h-10 sm:h-11" />;
                              }

                              return (
                                <SeatButton
                                  key={seat.id}
                                  seat={seat}
                                  clientSessionId={clientSessionId}
                                  onSeatClick={onSeatClick}
                                  disabled={disabled}
                                />
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="mx-auto w-full max-w-4xl">
          <div className="rounded-t-[1.75rem] border border-sky-300/60 bg-sky-100/80 py-3 shadow-[inset_0_-4px_0_rgba(147,197,253,0.45)]" />
          <p className="mt-3 text-center text-base font-medium text-slate-600">All eyes this way please</p>
        </div>
      </div>
    </div>
  );
}
