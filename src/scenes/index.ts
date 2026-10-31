import type React from 'react';
import {Balmer} from './Balmer';
import {Bohr} from './Bohr';
import {Crisis} from './Crisis';
import {Hook} from './Hook';
import {Ionization} from './Ionization';
import {Levels} from './Levels';
import {Limits} from './Limits';
import {Lines} from './Lines';
import {MatterWave} from './MatterWave';
import {Orbitals} from './Orbitals';
import {Outro} from './Outro';
import {Recap} from './Recap';
import {Roadmap} from './Roadmap';
import {Rutherford} from './Rutherford';
import {Thomson} from './Thomson';
import {Title} from './Title';

// Pemetaan id adegan di naskah → komponen visual.
export const SCENES: Record<string, React.FC> = {
  hook: Hook,
  title: Title,
  roadmap: Roadmap,
  thomson: Thomson,
  rutherford: Rutherford,
  crisis: Crisis,
  lines: Lines,
  bohr: Bohr,
  levels: Levels,
  ionization: Ionization,
  balmer: Balmer,
  limits: Limits,
  matterwave: MatterWave,
  orbitals: Orbitals,
  recap: Recap,
  outro: Outro,
};
