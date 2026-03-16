// 한국 로또 6/45 유틸리티 함수들

// 제1회 추첨일: 2002년 12월 7일 (토요일)
const FIRST_DRAW_DATE = new Date(2002, 11, 7); // month는 0-based (11 = 12월)
const FIRST_ROUND = 1;

/**
 * 회차 번호로 추첨일 계산
 * @param {number} round - 회차 번호
 * @returns {Date} 추첨일
 */
export function getDrawDateByRound(round) {
    const weeksDiff = round - FIRST_ROUND;
    const drawDate = new Date(FIRST_DRAW_DATE);
    drawDate.setDate(drawDate.getDate() + (weeksDiff * 7));
    return drawDate;
}

/**
 * 현재 회차 계산 (가장 최근 토요일 기준)
 * @returns {number} 현재 회차
 */
export function getCurrentRound() {
    const today = new Date();
    const lastSaturday = getLastSaturday(today);

    const diffTime = lastSaturday - FIRST_DRAW_DATE;
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));

    return FIRST_ROUND + diffWeeks;
}

/**
 * 다음 회차 계산
 * @returns {number} 다음 회차
 */
export function getNextRound() {
    return getCurrentRound() + 1;
}

/**
 * 다음 추첨일 계산
 * @returns {Date} 다음 추첨일
 */
export function getNextDrawDate() {
    const today = new Date();
    const nextSaturday = getNextSaturday(today);
    return nextSaturday;
}

/**
 * 가장 최근 토요일 구하기
 * @param {Date} date
 * @returns {Date}
 */
function getLastSaturday(date) {
    const result = new Date(date);
    const day = result.getDay();
    const diff = day === 6 ? 0 : (day + 1); // 토요일은 6
    result.setDate(result.getDate() - diff);
    result.setHours(0, 0, 0, 0);
    return result;
}

/**
 * 다음 토요일 구하기
 * @param {Date} date
 * @returns {Date}
 */
function getNextSaturday(date) {
    const result = new Date(date);
    const day = result.getDay();
    const daysUntilSaturday = (6 - day + 7) % 7;
    const addDays = daysUntilSaturday === 0 ? 7 : daysUntilSaturday;
    result.setDate(result.getDate() + addDays);
    result.setHours(0, 0, 0, 0);
    return result;
}

/**
 * 날짜 포맷팅 (YYYY-MM-DD)
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 날짜 포맷팅 (YYYY년 MM월 DD일)
 * @param {Date} date
 * @returns {string}
 */
export function formatDateKorean(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
}

/**
 * 날짜 포맷팅 with 요일 (YYYY-MM-DD (요일))
 * @param {Date} date
 * @returns {string}
 */
export function formatDateWithDay(date) {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dayName = days[date.getDay()];
    return `${year}-${month}-${day} (${dayName})`;
}

/**
 * 로또 정보 객체 반환
 * @returns {Object} { currentRound, nextRound, currentDrawDate, nextDrawDate }
 */
export function getLotteryInfo() {
    const currentRound = getCurrentRound();
    const nextRound = getNextRound();
    const currentDrawDate = getDrawDateByRound(currentRound);
    const nextDrawDate = getNextDrawDate();

    return {
        currentRound,
        nextRound,
        currentDrawDate,
        nextDrawDate,
        currentDrawDateFormatted: formatDateWithDay(currentDrawDate),
        nextDrawDateFormatted: formatDateWithDay(nextDrawDate)
    };
}
