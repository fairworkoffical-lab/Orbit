import { Visit } from './types';

/**
 * ORBIT Queue Engine (v1 - Survival Mode)
 * Implements the "Phantom Queue" derivation logic.
 */

export const BASE_SCORES = {
    EMERGENCY: 9999,
    APPOINTMENT: 50,
    FOLLOW_UP: 40,
    WALK_IN: 30,
};

export const TRIAGE_SCORES = {
    RED: 500,
    YELLOW: 200,
    GREEN: 0,
};

// Coefficient: How many points per minute of waiting?
// Design Doc: "(minutes_waited / 5) * 1.5" -> 0.3 points per minute
export const WAIT_TIME_COEFFICIENT = 0.3;

export function calculatePriorityScore(visit: Visit): number {
    if (visit.type === 'EMERGENCY') {
        return BASE_SCORES.EMERGENCY;
    }

    let score = 0;

    // 1. Baseline Score
    switch (visit.type) {
        case 'APPOINTMENT': score += BASE_SCORES.APPOINTMENT; break;
        case 'FOLLOW_UP': score += BASE_SCORES.FOLLOW_UP; break;
        case 'WALK_IN': score += BASE_SCORES.WALK_IN; break;
    }

    // 2. Wait Time Decay (Fairness)
    const minutesWaited = (Date.now() - new Date(visit.check_in_time).getTime()) / 60000;
    if (minutesWaited > 0) {
        score += minutesWaited * WAIT_TIME_COEFFICIENT;
    }

    // 3. Clinical Urgency
    if (visit.triage_category) {
        score += TRIAGE_SCORES[visit.triage_category] || 0;
    }

    // 4. Manual Override
    if (visit.override_flag && visit.override_weight) {
        score += visit.override_weight;
    }

    return Math.round(score * 100) / 100; // Round to 2 decimals
}

export function sortQueue(visits: Visit[]): Visit[] {
    return [...visits].sort((a, b) => {
        // Primary: Score DESC
        const scoreDiff = b.priority_score - a.priority_score;
        if (Math.abs(scoreDiff) > 0.1) return scoreDiff;

        // Secondary: Check-in Time ASC (FIFO fallback)
        return new Date(a.check_in_time).getTime() - new Date(b.check_in_time).getTime();
    });
}
