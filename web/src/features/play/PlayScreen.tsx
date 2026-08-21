/**
 * Spelen — the home for the wheels you play rather than the ones that suggest.
 *
 * Spelmodus sits at the top because it is the headline game: two wheels that
 * pick a direction and a distance and send you to a real spot on the map. Under
 * it live the wheels you build yourself, for every question the app knows
 * nothing about.
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import { useI18n } from '../../i18n';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSession } from '../../contexts/SessionContext';
import { useCatalog } from '../../hooks/useCatalog';
import { useNearby } from '../../hooks/useNearby';
import { useCompletions } from '../../hooks/useCompletions';
import { useWeather } from '../../hooks/useWeather';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { usePick, type Pick } from '../pick/usePick';
import { MechanicHost } from '../pick/MechanicHost';
import type { Phase } from '../pick/types';
import { searchRadius } from '../../lib/session';
import { Card, EmptyState } from '../../components/ui/primitives';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/icons/Icon';
import { transportLabel, formatKm, clampRange } from '../../lib/session';
import {
  WHEEL_TEMPLATES,
  deleteWheel,
  isSpinnable,
  loadWheels,
  type CustomWheel,
} from '../../lib/customWheels';
import { CustomWheelSpinner } from './CustomWheelSpinner';
import { WheelEditor } from './WheelEditor';
import { SessionSheet } from '../session/SessionSheet';
import './play.css';
import '../pick/pick.css';

type Seed = { name: string; emoji: string; options: string[] } | null;

export default function PlayScreen() {
  const { t, lang } = useI18n();
  const { show } = useToast();
  const { profile } = useAuth();
  const { config, ranges } = useSession();
  const reducedMotion = useReducedMotion();

  /* ---- Spelmodus runs here, with its own draw ---- */
  const { categories, activities } = useCatalog();
  const { origin, pois } = useNearby(categories, searchRadius(config, ranges), 'all');
  const weather = useWeather(origin);
  const { complete } = useCompletions();
  const api = usePick({
    categories,
    activities,
    pois,
    origin,
    config,
    ranges,
    preferIndoor: !!weather?.preferIndoor,
    lang,
  });

  const [questOpen, setQuestOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [pick, setPick] = useState<Pick | null>(null);
  const pickRef = useRef<Pick | null>(null);

  const onStart = useCallback(
    (supplied?: Pick | null) => {
      const next = supplied ?? api.drawPick();
      if (!next) return;
      pickRef.current = next;
      setPick(next);
      setPhase('running');
    },
    [api]
  );
  const onSettled = useCallback(() => setPhase('done'), []);
  const onReset = useCallback(() => {
    pickRef.current = null;
    setPick(null);
    setPhase('idle');
  }, []);

  /** "Ik doe het" — bank it straight away; photos and ratings stay on the dashboard. */
  const onAccept = useCallback(async () => {
    const chosen = pickRef.current;
    if (!chosen) return;
    setQuestOpen(false);
    try {
      const prof = await complete({
        title: chosen.title,
        categoryId: chosen.category.id,
        source: chosen.source,
        lat: chosen.coords?.lat ?? null,
        lng: chosen.coords?.lng ?? null,
        placeName: chosen.placeName ?? null,
        points: 10 + chosen.category.sort_order,
      });
      show(t('toast.completed', { n: prof.xp - (profile?.xp ?? 0) }), 'success');
    } catch {
      show(t('common.error'), 'error');
    }
    onReset();
  }, [complete, onReset, profile, show, t]);

  const [wheels, setWheels] = useState<CustomWheel[]>(loadWheels);
  const [openId, setOpenId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<CustomWheel | null>(null);
  const [seed, setSeed] = useState<Seed>(null);
  const [sessionOpen, setSessionOpen] = useState(false);

  const range = clampRange(config.transport, ranges[config.transport]);

  const refresh = useCallback(() => setWheels(loadWheels()), []);

  const startNew = (s: Seed = null) => {
    setEditing(null);
    setSeed(s);
    setEditorOpen(true);
  };

  const startEdit = (wheel: CustomWheel) => {
    setEditing(wheel);
    setSeed(null);
    setEditorOpen(true);
  };

  const remove = (wheel: CustomWheel) => {
    if (!window.confirm(t('wheels.deleteConfirm', { name: wheel.name }))) return;
    deleteWheel(wheel.id);
    if (openId === wheel.id) setOpenId(null);
    refresh();
  };

  /** Template options live in the dictionaries as one comma-separated string. */
  const templates = useMemo(
    () =>
      WHEEL_TEMPLATES.map((tpl) => ({
        emoji: tpl.emoji,
        name: t(`wheels.tpl.${tpl.id}.name`),
        options: t(`wheels.tpl.${tpl.id}.options`)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      })),
    [t]
  );

  return (
    <div className="play">
      <header className="screen-head">
        <h1>{t('play.title')}</h1>
        <p className="muted">{t('play.subtitle')}</p>
      </header>

      {/* The headline game. */}
      <Card className="play__hero">
        <div className="play__hero-head">
          <span className="play__hero-icon">
            <Icon name="navigation" size={24} />
          </span>
          <div>
            <h2>{t('quest.eyebrow')}</h2>
            <p className="muted">{t('play.questBlurb')}</p>
          </div>
        </div>

        <button className="play__range" onClick={() => setSessionOpen(true)}>
          <span className="play__range-pill">
            <Icon name={config.transport === 'walk' ? 'walk' : config.transport} size={15} />
            {transportLabel(config.transport, lang)}
          </span>
          <span className="play__range-pill">
            <Icon name="ruler" size={15} />
            {formatKm(range.minKm, lang)}–{formatKm(range.maxKm, lang)} km
          </span>
          <span className="play__range-edit">
            <Icon name="sliders" size={17} />
          </span>
        </button>

        <Button
          size="lg"
          block
          icon="navigation"
          onClick={() => {
            onReset();
            setQuestOpen(true);
          }}
        >
          {t('play.questStart')}
        </Button>
        <p className="play__hero-note">{t('play.questWhere')}</p>
      </Card>

      {/* Your own wheels. */}
      <section className="play__section">
        <div className="play__section-head">
          <h2 className="section-title">{t('wheels.title')}</h2>
          <Button variant="secondary" size="sm" icon="plus" onClick={() => startNew()}>
            {t('wheels.new')}
          </Button>
        </div>

        {wheels.length === 0 ? (
          <>
            <EmptyState icon="dice" title={t('wheels.emptyTitle')} body={t('wheels.emptyBody')} />
            <div className="play__templates">
              {templates.map((tpl) => (
                <button key={tpl.name} className="play__template" onClick={() => startNew(tpl)}>
                  <span className="play__template-emoji">{tpl.emoji}</span>
                  <span className="play__template-name">{tpl.name}</span>
                  <span className="play__template-count">
                    {t('wheels.optionCount', { n: tpl.options.length })}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="play__wheels">
            {wheels.map((wheel) => {
              const open = openId === wheel.id;
              return (
                <Card key={wheel.id} className={`play__wheel ${open ? 'is-open' : ''}`}>
                  <div className="play__wheel-head">
                    <button
                      className="play__wheel-title"
                      onClick={() => setOpenId(open ? null : wheel.id)}
                      aria-expanded={open}
                    >
                      <span className="play__wheel-emoji">{wheel.emoji}</span>
                      <span>
                        <strong>{wheel.name}</strong>
                        <span className="muted">
                          {isSpinnable(wheel)
                            ? t('wheels.optionCount', { n: wheel.options.length })
                            : t('wheels.needTwo')}
                        </span>
                      </span>
                      <Icon name={open ? 'chevron-down' : 'chevron-right'} size={20} />
                    </button>
                  </div>

                  {open && (
                    <>
                      {isSpinnable(wheel) ? (
                        <CustomWheelSpinner wheel={wheel} reducedMotion={reducedMotion} />
                      ) : (
                        <p className="play__wheel-warn">{t('wheels.needTwo')}</p>
                      )}
                      <div className="play__wheel-actions">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon="edit"
                          onClick={() => startEdit(wheel)}
                        >
                          {t('wheels.edit')}
                        </Button>
                        <Button variant="danger" size="sm" icon="x" onClick={() => remove(wheel)}>
                          {t('wheels.delete')}
                        </Button>
                      </div>
                    </>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <WheelEditor
        open={editorOpen}
        wheel={editing}
        seed={seed}
        onClose={() => setEditorOpen(false)}
        onSaved={(saved) => {
          refresh();
          setOpenId(saved.id);
        }}
      />
      {questOpen && (
        <MechanicHost
          mechanic="quest"
          phase={phase}
          pick={pick}
          api={api}
          onStart={onStart}
          onSettled={onSettled}
          onAccept={onAccept}
          onReset={onReset}
          reducedMotion={reducedMotion}
          onClose={() => {
            setQuestOpen(false);
            onReset();
          }}
          onSwap={() => setQuestOpen(false)}
        />
      )}
      <SessionSheet open={sessionOpen} onClose={() => setSessionOpen(false)} />
    </div>
  );
}
