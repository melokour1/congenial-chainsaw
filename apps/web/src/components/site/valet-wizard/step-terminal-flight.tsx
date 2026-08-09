'use client';

import { TERMINALS } from '@laxvaletcare/shared';
import { Button } from '@/components/ui';
import type { ValetWizardData } from './types';

export function StepTerminalFlight({
  data,
  update,
  onNext,
  onBack,
}: {
  data: ValetWizardData;
  update: (patch: Partial<ValetWizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const isLax = data.originType === 'LAX';
  const selectedTerminal = TERMINALS.find((t) => t.code === data.terminalCode);

  const effectiveDepartingAirline = data.airline === '__other__' ? data.airlineOther : data.airline;

  const canContinue = isLax
    ? !!data.terminalCode && !!effectiveDepartingAirline && !!data.departureDate && !!data.returnDateEstimate && !!data.departingFlightNumber
    : !!data.departureDate && !!data.returnDateEstimate && !!data.departingFlightNumber && !!data.departingAirline;

  function handleContinue() {
    if (isLax) {
      update({ departingAirline: effectiveDepartingAirline });
    }
    onNext();
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Terminal &amp; flight details</h2>
      <p className="mt-1 text-sm text-medium-gray">
        {isLax ? 'Pick your terminal and airline so we know exactly where to meet you.' : 'Tell us your flight details.'}
      </p>

      {isLax && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-semibold">Terminal</p>
          <div className="flex flex-wrap gap-2">
            {TERMINALS.map((t) => (
              <button
                key={t.code}
                type="button"
                disabled={t.isClosed}
                onClick={() => update({ terminalCode: t.code, airline: '', airlineOther: '' })}
                className={`min-h-[48px] rounded-card border px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  data.terminalCode === t.code
                    ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                    : 'border-light-gray hover:border-black dark:border-[#2A2A2A] dark:hover:border-white'
                }`}
                title={t.isClosed ? t.closedNote : t.note}
              >
                Terminal {t.code}
                {t.isClosed ? ' (closed)' : ''}
              </button>
            ))}
          </div>
          {selectedTerminal?.note && (
            <p className="mt-2 text-xs text-medium-gray">{selectedTerminal.note}</p>
          )}

          {selectedTerminal && !selectedTerminal.isClosed && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold">Airline</p>
              <div className="flex flex-wrap gap-2">
                {selectedTerminal.airlines.map((airline) => (
                  <button
                    key={airline}
                    type="button"
                    onClick={() => update({ airline })}
                    className={`min-h-[44px] rounded-card border px-3 text-sm transition-colors ${
                      data.airline === airline
                        ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                        : 'border-light-gray hover:border-black dark:border-[#2A2A2A] dark:hover:border-white'
                    }`}
                  >
                    {airline}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => update({ airline: '__other__' })}
                  className={`min-h-[44px] rounded-card border px-3 text-sm transition-colors ${
                    data.airline === '__other__'
                      ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                      : 'border-light-gray hover:border-black dark:border-[#2A2A2A] dark:hover:border-white'
                  }`}
                >
                  Other
                </button>
              </div>
              {data.airline === '__other__' && (
                <input
                  type="text"
                  placeholder="Airline name"
                  value={data.airlineOther}
                  onChange={(e) => update({ airlineOther: e.target.value })}
                  className="mt-2 min-h-[48px] w-full max-w-xs rounded-card border border-light-gray bg-transparent px-3 text-sm dark:border-[#2A2A2A]"
                />
              )}
            </div>
          )}
        </div>
      )}

      {!isLax && (
        <div className="mt-6">
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Airline
            <input
              type="text"
              value={data.departingAirline}
              onChange={(e) => update({ departingAirline: e.target.value })}
              placeholder={data.originType === 'JSX' ? 'JSX' : 'Operator name'}
              className="min-h-[48px] w-full max-w-xs rounded-card border border-light-gray bg-transparent px-3 text-sm font-normal dark:border-[#2A2A2A]"
            />
          </label>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Departure date &amp; time
          <input
            type="datetime-local"
            value={data.departureDate}
            onChange={(e) => update({ departureDate: e.target.value })}
            className="min-h-[48px] rounded-card border border-light-gray bg-transparent px-3 text-sm font-normal dark:border-[#2A2A2A]"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Estimated return date &amp; time
          <input
            type="datetime-local"
            value={data.returnDateEstimate}
            onChange={(e) => update({ returnDateEstimate: e.target.value })}
            className="min-h-[48px] rounded-card border border-light-gray bg-transparent px-3 text-sm font-normal dark:border-[#2A2A2A]"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Departing flight number
          <input
            type="text"
            value={data.departingFlightNumber}
            onChange={(e) => update({ departingFlightNumber: e.target.value })}
            placeholder="e.g. WN 452"
            className="min-h-[48px] rounded-card border border-light-gray bg-transparent px-3 text-sm font-normal dark:border-[#2A2A2A]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Bags
          <input
            type="text"
            value={data.bagsInfo}
            onChange={(e) => update({ bagsInfo: e.target.value })}
            placeholder="e.g. 2 checked, 1 carry-on"
            className="min-h-[48px] rounded-card border border-light-gray bg-transparent px-3 text-sm font-normal dark:border-[#2A2A2A]"
          />
        </label>
      </div>

      <div className="mt-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={data.skipReturnFlight}
            onChange={(e) => update({ skipReturnFlight: e.target.checked, returningAirline: '', returningFlightNumber: '' })}
            className="h-5 w-5 rounded border-light-gray"
          />
          I&rsquo;ll add my return flight later
        </label>
        {!data.skipReturnFlight && (
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-semibold">
              Returning airline
              <input
                type="text"
                value={data.returningAirline}
                onChange={(e) => update({ returningAirline: e.target.value })}
                className="min-h-[48px] rounded-card border border-light-gray bg-transparent px-3 text-sm font-normal dark:border-[#2A2A2A]"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold">
              Returning flight number
              <input
                type="text"
                value={data.returningFlightNumber}
                onChange={(e) => update({ returningFlightNumber: e.target.value })}
                className="min-h-[48px] rounded-card border border-light-gray bg-transparent px-3 text-sm font-normal dark:border-[#2A2A2A]"
              />
            </label>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="secondary" className="h-12 px-8" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" className="h-12 px-8" onClick={handleContinue} disabled={!canContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
