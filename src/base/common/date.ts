/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const minute = 60;
const hour = minute * 60;
const day = hour * 24;
const week = day * 7;
const month = day * 30;
const year = day * 365;

export function fromNow(date: number | Date, appendAgoLabel?: boolean, useFullTimeWords?: boolean): string {
  if (typeof date !== 'number') {
    date = date.getTime();
  }

  const seconds = Math.round((new Date().getTime() - date) / 1000);
  if (seconds < -30) {
    return `date.fromNow.in: in ${fromNow(new Date().getTime() + seconds * 1000)}`;
  }

  if (seconds < 30) {
    return 'date.fromNow.now: now';
  }

  let value: number;
  if (seconds < minute) {
    value = seconds;

    if (appendAgoLabel) {
      if (value === 1) {
        return useFullTimeWords
          ? `date.fromNow.seconds.singular.ago.fullWord: ${value} second ago`
          : `date.fromNow.seconds.singular.ago: ${value} sec ago`;
      } else {
        return useFullTimeWords
          ? 'date.fromNow.seconds.plural.ago.fullWord: {value} seconds ago'
          : 'date.fromNow.seconds.plural.ago: {value} secs ago';
      }
    } else {
      if (value === 1) {
        return useFullTimeWords
          ? `date.fromNow.seconds.singular.fullWord: ${value} second`
          : `date.fromNow.seconds.singular: ${value} second`;
      } else {
        return useFullTimeWords
          ? `date.fromNow.seconds.plural.fullWord: ${value} seconds`
          : `date.fromNow.seconds.plural: ${value} secs`;
      }
    }
  }

  if (seconds < hour) {
    value = Math.floor(seconds / minute);
    if (appendAgoLabel) {
      if (value === 1) {
        return useFullTimeWords
          ? `date.fromNow.minutes.singular.ago.fullWord: ${value} minute ago`
          : `date.fromNow.minutes.singular.ago: ${value} min ago`;
      } else {
        return useFullTimeWords
          ? `date.fromNow.minutes.plural.ago.fullWord: ${value} minutes ago`
          : `date.fromNow.minutes.plural.ago: ${value} mins ago`;
      }
    } else {
      if (value === 1) {
        return useFullTimeWords
          ? `date.fromNow.minutes.singular.fullWord: ${value} minute`
          : `date.fromNow.minutes.singular: ${value} min`;
      } else {
        return useFullTimeWords
          ? `date.fromNow.minutes.plural.fullWord: ${value} minutes`
          : `date.fromNow.minutes.plural: ${value} mins`;
      }
    }
  }

  if (seconds < day) {
    value = Math.floor(seconds / hour);
    if (appendAgoLabel) {
      if (value === 1) {
        return useFullTimeWords
          ? `date.fromNow.hours.singular.ago.fullWord: ${value} hour ago`
          : `date.fromNow.hours.singular.ago: ${value} hr ago`;
      } else {
        return useFullTimeWords
          ? `date.fromNow.hours.plural.ago.fullWord: ${value} hours ago`
          : `date.fromNow.hours.plural.ago: ${value} hrs ago`;
      }
    } else {
      if (value === 1) {
        return useFullTimeWords
          ? `date.fromNow.hours.singular.fullWord: ${value} hour`
          : `date.fromNow.hours.singular: ${value} hr`;
      } else {
        return useFullTimeWords
          ? `date.fromNow.hours.plural.fullWord: ${value} hours`
          : `date.fromNow.hours.plural: ${value} hrs`;
      }
    }
  }

  if (seconds < week) {
    value = Math.floor(seconds / day);
    if (appendAgoLabel) {
      return value === 1
        ? `date.fromNow.days.singular.ago: ${value} day ago`
        : `date.fromNow.days.plural.ago: ${value} days ago`;
    } else {
      return value === 1
        ? `date.fromNow.days.singular: ${value} day`
        : `date.fromNow.days.plural: ${value} days`;
    }
  }

  if (seconds < month) {
    value = Math.floor(seconds / week);
    if (appendAgoLabel) {
      if (value === 1) {
        return useFullTimeWords
          ? `date.fromNow.weeks.singular.ago.fullWord: ${value} week ago`
          : `date.fromNow.weeks.singular.ago: ${value} wk ago`;
      } else {
        return useFullTimeWords
          ? `date.fromNow.weeks.plural.ago.fullWord: ${value} weeks ago`
          : `date.fromNow.weeks.plural.ago: ${value} wks ago`;
      }
    } else {
      if (value === 1) {
        return useFullTimeWords
          ? `date.fromNow.weeks.singular.fullWord: ${value} week`
          : `date.fromNow.weeks.singular: ${value} wk`;
      } else {
        return useFullTimeWords
          ? `date.fromNow.weeks.plural.fullWord: ${value} weeks`
          : `date.fromNow.weeks.plural: ${value} wks`;
      }
    }
  }

  if (seconds < year) {
    value = Math.floor(seconds / month);
    if (appendAgoLabel) {
      if (value === 1) {
        return useFullTimeWords
          ? `date.fromNow.months.singular.ago.fullWord: ${value} month ago`
          : `date.fromNow.months.singular.ago: ${value} mo ago`;
      } else {
        return useFullTimeWords
          ? `date.fromNow.months.plural.ago.fullWord: ${value} months ago`
          : `date.fromNow.months.plural.ago: ${value} mos ago`;
      }
    } else {
      if (value === 1) {
        return useFullTimeWords
          ? `date.fromNow.months.singular.fullWord: ${value} month`
          : `date.fromNow.months.singular: ${value} mo`;
      } else {
        return useFullTimeWords
          ? `date.fromNow.months.plural.fullWord: ${value} months`
          : `date.fromNow.months.plural: ${value} mos`;
      }
    }
  }

  value = Math.floor(seconds / year);
  if (appendAgoLabel) {
    if (value === 1) {
      return useFullTimeWords
        ? `date.fromNow.years.singular.ago.fullWord: ${value} year ago`
        : `date.fromNow.years.singular.ago: ${value} yr ago`;
    } else {
      return useFullTimeWords
        ? `date.fromNow.years.plural.ago.fullWord: ${value} years ago`
        : `date.fromNow.years.plural.ago: ${value} yrs ago`;
    }
  } else {
    if (value === 1) {
      return useFullTimeWords
        ? `date.fromNow.years.singular.fullWord: ${value} year`
        : `date.fromNow.years.singular: ${value} yr`;
    } else {
      return useFullTimeWords
        ? `date.fromNow.years.plural.fullWord: ${value} years`
        : `date.fromNow.years.plural: ${value} yrs`;
    }
  }
}

export function toLocalISOString(date: Date): string {
  return date.getFullYear() +
    '-' + String(date.getMonth() + 1).padStart(2, '0') +
    '-' + String(date.getDate()).padStart(2, '0') +
    'T' + String(date.getHours()).padStart(2, '0') +
    ':' + String(date.getMinutes()).padStart(2, '0') +
    ':' + String(date.getSeconds()).padStart(2, '0') +
    '.' + (date.getMilliseconds() / 1000).toFixed(3).slice(2, 5) +
    'Z';
}
