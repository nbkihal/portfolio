"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Keyboard, RotateCcw, X } from "lucide-react";

import { cn } from "@/lib/utils";

/*
 * Typing speed test: 15 common English words. The timer starts on the
 * first key; results show WPM, raw WPM, accuracy and a per-second chart.
 * Enter or Tab restarts with new words, Esc exits.
 */

const WORD_COUNT = 15;
const BEST_KEY = "typing-test-best-wpm";

const WORDS =
  `the be to of and a in that have it for not on with he as you do at
this but his by from they we say her she or an will my one all would there their
what so up out if about who get which go me when make can like time no just him
know take people into year your good some could them see other than then now look
only come its over think also back after use two how our work first well way even
new want because any these give day most us great between need large often hand
high place hold turn without house point world while right still learn plant cover
food sun four state keep eye never last let thought city tree cross farm hard start
might story saw far sea draw left late run press close night real life few north
open seem together next white children begin got walk example ease paper group
always music those both mark book letter until mile river car feet care second
enough plain girl usual young ready above ever red list though feel talk bird soon
body dog family direct pose leave song measure door product black short numeral
class wind question happen complete ship area half rock order fire south problem
piece told knew pass since top whole king space heard best hour better true during
hundred five remember step early west ground interest reach fast verb sing listen
six table travel less morning ten simple several vowel toward war lay against
pattern slow center love person money serve appear road map rain rule govern pull
cold notice voice unit power town fine certain fly fall lead cry dark machine note
wait plan figure star box noun field rest correct able pound done beauty drive stood
contain front teach week final gave green quick develop ocean warm free minute
strong special mind behind clear tail produce fact street inch multiply nothing
course stay wheel full force blue object decide surface deep moon island foot system
busy test record boat common gold possible plane age dry wonder laugh thousand ago
ran check game shape equate miss brought heat snow tire bring yes distant fill east
paint language among code light build ship data screen logic`.split(/\s+/);

function pickWords() {
  const out: string[] = [];
  while (out.length < WORD_COUNT) {
    const w = WORDS[Math.floor(Math.random() * WORDS.length)];
    if (w !== out[out.length - 1]) out.push(w);
  }
  return out;
}

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

interface Stats {
  wpm: number;
  raw: number;
  accuracy: number;
  seconds: number;
  correct: number;
  incorrect: number;
  extra: number;
  missed: number;
  samples: number[];
}

/** Characters typed correctly in finished-correct words (+ their spaces). */
function correctChars(words: string[], typed: string[], upTo: number) {
  let n = 0;
  for (let i = 0; i <= upTo && i < words.length; i++) {
    const t = typed[i] ?? "";
    if (i < upTo) {
      if (t === words[i]) n += words[i].length + 1;
    } else {
      // Current word: count the correct prefix.
      let k = 0;
      while (k < t.length && t[k] === words[i][k]) k++;
      n += k;
    }
  }
  return n;
}

export function TypingTest({ onExit }: { onExit: () => void }) {
  const [words, setWords] = React.useState<string[]>(() => pickWords());
  const [typed, setTyped] = React.useState<string[]>([""]);
  const [current, setCurrent] = React.useState(0);
  const [startedAt, setStartedAt] = React.useState<number | null>(null);
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [focused, setFocused] = React.useState(true);
  const [best, setBest] = React.useState(0);
  const [now, setNow] = React.useState(0);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const wordsRef = React.useRef<HTMLDivElement>(null);
  const keys = React.useRef({ correct: 0, incorrect: 0 });
  const samples = React.useRef<number[]>([]);
  const [caret, setCaret] = React.useState({ x: 0, y: 0, h: 0 });

  React.useEffect(() => setBest(readBest()), []);
  React.useEffect(() => inputRef.current?.focus(), [words]);

  // Live clock + one WPM sample per second while the test runs.
  React.useEffect(() => {
    if (startedAt === null || stats) return;
    const id = window.setInterval(() => setNow(performance.now()), 250);
    return () => window.clearInterval(id);
  }, [startedAt, stats]);

  const elapsed =
    startedAt === null ? 0 : ((stats ? 0 : now) - startedAt) / 1000;
  const liveWpm =
    startedAt !== null && elapsed > 0.5
      ? Math.round(correctChars(words, typed, current) / 5 / (elapsed / 60))
      : 0;

  React.useEffect(() => {
    if (startedAt === null || stats) return;
    const second = Math.floor(elapsed);
    if (second >= 1 && samples.current.length < second) {
      samples.current.push(liveWpm);
    }
  }, [elapsed, liveWpm, startedAt, stats]);

  // Place the caret at the next character to type.
  React.useLayoutEffect(() => {
    const root = wordsRef.current;
    if (!root) return;
    const wordEl = root.querySelector<HTMLElement>(`[data-word="${current}"]`);
    if (!wordEl) return;
    const letters = wordEl.querySelectorAll<HTMLElement>("[data-letter]");
    const index = (typed[current] ?? "").length;
    const base = root.getBoundingClientRect();
    const target = letters[Math.min(index, letters.length - 1)];
    if (!target) return;
    const rect = target.getBoundingClientRect();
    setCaret({
      x: (index >= letters.length ? rect.right : rect.left) - base.left,
      y: rect.top - base.top,
      h: rect.height,
    });
  }, [typed, current, words]);

  const finish = (finalTyped: string[], lastIndex: number) => {
    const end = performance.now();
    const seconds = Math.max(0.1, (end - (startedAt ?? end)) / 1000);
    const minutes = seconds / 60;
    let correct = 0;
    let incorrect = 0;
    let extra = 0;
    let missed = 0;
    words.forEach((word, i) => {
      const t = finalTyped[i] ?? "";
      for (let k = 0; k < Math.max(word.length, t.length); k++) {
        if (k >= word.length) extra++;
        else if (k >= t.length) missed++;
        else if (t[k] === word[k]) correct++;
        else incorrect++;
      }
    });
    const typedChars = finalTyped.join(" ").length;
    const wpm = Math.round(
      correctChars(words, finalTyped, lastIndex) / 5 / minutes,
    );
    const { correct: ok, incorrect: bad } = keys.current;
    const result: Stats = {
      wpm,
      raw: Math.round(typedChars / 5 / minutes),
      accuracy: ok + bad ? Math.round((ok / (ok + bad)) * 100) : 100,
      seconds,
      correct,
      incorrect,
      extra,
      missed,
      samples: [...samples.current, wpm],
    };
    setStats(result);
    if (wpm > readBest()) {
      try {
        localStorage.setItem(BEST_KEY, String(wpm));
      } catch {
        /* best just won't persist */
      }
      setBest(wpm);
    }
  };

  const restart = (sameWords = false) => {
    if (!sameWords) setWords(pickWords());
    setTyped([""]);
    setCurrent(0);
    setStartedAt(null);
    setStats(null);
    keys.current = { correct: 0, incorrect: 0 };
    samples.current = [];
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (stats) return;
    const value = e.target.value;
    const prev = typed[current] ?? "";
    if (startedAt === null && value.length > 0) {
      const t = performance.now();
      setStartedAt(t);
      setNow(t);
    }

    // Space commits the word (ignored on an empty word).
    if (value.endsWith(" ")) {
      const word = value.trim();
      if (!word) return;
      const next = [...typed];
      next[current] = word;
      if (word === words[current]) keys.current.correct++;
      else keys.current.incorrect++;
      if (current === words.length - 1) {
        setTyped(next);
        finish(next, current);
        return;
      }
      next[current + 1] = "";
      setTyped(next);
      setCurrent(current + 1);
      return;
    }

    if (value.length > prev.length) {
      const k = value.length - 1;
      if (value[k] === words[current][k]) keys.current.correct++;
      else keys.current.incorrect++;
    }
    const next = [...typed];
    next[current] = value;
    setTyped(next);
    // Last word typed exactly: finish without needing a space.
    if (current === words.length - 1 && value === words[current]) {
      finish(next, current);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onExit();
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      restart();
    } else if (
      e.key === "Backspace" &&
      (typed[current] ?? "") === "" &&
      current > 0 &&
      typed[current - 1] !== words[current - 1]
    ) {
      // Step back into the previous word only if it has a mistake.
      e.preventDefault();
      setCurrent(current - 1);
    }
  };

  const progress = Math.min(current, WORD_COUNT);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6"
      onPointerDown={(e) => {
        if (!(e.target as Element).closest("button")) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }}
    >
      <button
        type="button"
        onClick={onExit}
        className="absolute left-6 top-24 inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur transition-colors hover:border-brand hover:text-foreground md:left-10"
      >
        <X className="size-3.5" />
        Exit <kbd className="font-mono text-[10px] opacity-60">Esc</kbd>
      </button>
      <p className="absolute right-6 top-24 font-mono text-sm text-muted-foreground md:right-10">
        best <span className="text-foreground">{best}</span> wpm
      </p>

      <input
        ref={inputRef}
        value={stats ? "" : (typed[current] ?? "")}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label="Type the words shown"
        className="absolute h-px w-px opacity-0"
      />

      {stats ? (
        <Results
          stats={stats}
          best={best}
          onRestart={() => restart()}
          onRepeat={() => restart(true)}
        />
      ) : (
        <div className="w-full max-w-4xl">
          {/* Live stats */}
          <div className="mb-6 flex items-baseline gap-6 font-mono text-brand">
            <span className="text-3xl font-bold tabular-nums">
              {progress}/{WORD_COUNT}
            </span>
            {startedAt !== null ? (
              <>
                <span className="tabular-nums text-muted-foreground">
                  {liveWpm} wpm
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {elapsed.toFixed(1)}s
                </span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">
                english · {WORD_COUNT} words · start typing
              </span>
            )}
          </div>

          {/* Words */}
          <div
            ref={wordsRef}
            className={cn(
              "relative flex flex-wrap gap-x-[0.6em] gap-y-3 font-mono text-2xl leading-relaxed transition-[filter,opacity] duration-300 sm:text-3xl md:text-[2.1rem]",
              !focused && "opacity-40 blur-[3px]",
            )}
          >
            {words.map((word, wi) => {
              const t = typed[wi] ?? "";
              const done = wi < current;
              const wrong = done && t !== word;
              return (
                <span
                  key={wi}
                  data-word={wi}
                  className={cn(
                    "relative inline-flex",
                    wrong &&
                      "underline decoration-destructive/70 decoration-2 underline-offset-[6px]",
                  )}
                >
                  {word.split("").map((ch, ci) => {
                    const typedCh = t[ci];
                    const state =
                      typedCh === undefined
                        ? done
                          ? "missed"
                          : "pending"
                        : typedCh === ch
                          ? "correct"
                          : "wrong";
                    return (
                      <span
                        key={ci}
                        data-letter
                        className={cn(
                          "transition-colors duration-100",
                          state === "pending" && "text-muted-foreground/45",
                          state === "missed" && "text-muted-foreground/45",
                          state === "correct" &&
                            "text-foreground drop-shadow-[0_0_10px_hsl(var(--brand)/0.55)]",
                          state === "wrong" && "text-destructive",
                        )}
                      >
                        {ch}
                      </span>
                    );
                  })}
                  {t.length > word.length
                    ? t
                        .slice(word.length)
                        .split("")
                        .map((ch, ci) => (
                          <span
                            key={`x${ci}`}
                            data-letter
                            className="text-destructive/70"
                          >
                            {ch}
                          </span>
                        ))
                    : null}
                </span>
              );
            })}

            {/* Caret */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 w-[3px] rounded-full bg-gradient-to-b from-brand to-cyan shadow-[0_0_12px_hsl(var(--brand))]"
              animate={{
                x: caret.x - 1,
                y: caret.y + caret.h * 0.12,
                height: caret.h * 0.76,
              }}
              transition={{ type: "spring", stiffness: 700, damping: 40 }}
              style={{ opacity: focused ? 1 : 0 }}
            />
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            {!focused ? (
              <span className="inline-flex items-center gap-2 text-foreground">
                <Keyboard className="size-4" /> Click here to focus
              </span>
            ) : null}
            <span>
              <kbd className="rounded border px-1.5 py-0.5 font-mono">
                enter
              </kbd>{" "}
              restart
            </span>
            <span>
              <kbd className="rounded border px-1.5 py-0.5 font-mono">esc</kbd>{" "}
              exit
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function Results({
  stats,
  best,
  onRestart,
  onRepeat,
}: {
  stats: Stats;
  best: number;
  onRestart: () => void;
  onRepeat: () => void;
}) {
  const max = Math.max(...stats.samples, 10);
  const points = stats.samples
    .map((v, i) => {
      const x =
        stats.samples.length > 1 ? (i / (stats.samples.length - 1)) * 100 : 50;
      return `${x},${40 - (v / max) * 36}`;
    })
    .join(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl"
      aria-live="polite"
    >
      <div className="grid gap-8 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="flex gap-10 sm:flex-col sm:gap-4">
          <div>
            <p className="font-mono text-sm text-muted-foreground">wpm</p>
            <p className="text-gradient font-display text-6xl font-bold leading-none md:text-7xl">
              {stats.wpm}
            </p>
          </div>
          <div>
            <p className="font-mono text-sm text-muted-foreground">acc</p>
            <p className="font-display text-5xl font-bold leading-none text-foreground md:text-6xl">
              {stats.accuracy}%
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card/60 p-4 backdrop-blur">
          <svg
            viewBox="0 0 100 42"
            className="h-32 w-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="wpm-line" x1="0" x2="1">
                <stop offset="0" stopColor="hsl(var(--brand))" />
                <stop offset="1" stopColor="hsl(var(--cyan))" />
              </linearGradient>
            </defs>
            {[10, 20, 30].map((y) => (
              <line
                key={y}
                x1="0"
                x2="100"
                y1={y}
                y2={y}
                stroke="hsl(var(--border))"
                strokeWidth="0.3"
              />
            ))}
            <polyline
              points={points}
              fill="none"
              stroke="url(#wpm-line)"
              strokeWidth="1.2"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{ filter: "drop-shadow(0 0 4px hsl(var(--brand)))" }}
            />
          </svg>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            wpm per second
          </p>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4 font-mono sm:grid-cols-4">
        {[
          ["raw", String(stats.raw)],
          ["time", `${stats.seconds.toFixed(1)}s`],
          [
            "characters",
            `${stats.correct}/${stats.incorrect}/${stats.extra}/${stats.missed}`,
          ],
          ["best", `${best} wpm`],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-xl text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 font-mono text-[11px] text-muted-foreground/70">
        characters = correct / incorrect / extra / missed
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-cyan px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_-4px_hsl(var(--brand)/0.8)] transition-transform hover:scale-[1.03]"
        >
          <RotateCcw className="size-4" />
          Next test
          <kbd className="rounded bg-white/20 px-1.5 font-mono text-[10px]">
            enter
          </kbd>
        </button>
        <button
          type="button"
          onClick={onRepeat}
          className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-brand hover:text-foreground"
        >
          Repeat these words
        </button>
      </div>
    </motion.div>
  );
}
