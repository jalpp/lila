import { h, VNode } from 'snabbdom';
import * as licon from 'common/licon';
import { Notification, Renderer, Renderers } from './interfaces';

// function generic(n: Notification, url: string | undefined, icon: string, content: VNode[]): VNode {
export default function makeRenderers(trans: Trans): Renderers {
  return {
    streamStart: {
      html: n =>
        generic(n, `/streamer/${n.content.sid}/redirect`, licon.Mic, [
          h('span', [h('strong', n.content.name), drawTime(n)]),
          h('span', trans('startedStreaming')),
        ]),
      text: n => trans('xStartedStreaming', n.content.streamerName),
    },
    genericLink: {
      html: n =>
        generic(n, n.content.url, n.content.icon, [
          h('span', [h('strong', n.content.title), drawTime(n)]),
          h('span', n.content.text),
        ]),
      text: n => n.content.title || n.content.text,
    },
    mention: {
      html: n =>
        generic(n, `/forum/redirect/post/${n.content.postId}`, licon.BubbleConvo, [
          h('span', [h('strong', userFullName(n.content.mentionedBy)), drawTime(n)]),
          h('span', trans('mentionedYouInX', n.content.topic)),
        ]),
      text: n => trans('xMentionedYouInY', userFullName(n.content.mentionedBy), n.content.topic),
    },
    invitedStudy: {
      html: n =>
        generic(n, '/study/' + n.content.studyId, licon.StudyBoard, [
          h('span', [h('strong', userFullName(n.content.invitedBy)), drawTime(n)]),
          h('span', trans('invitedYouToX', n.content.studyName)),
        ]),
      text: n => trans('xInvitedYouToY', userFullName(n.content.invitedBy), n.content.studyName),
    },
    privateMessage: {
      html: n =>
        generic(n, '/inbox/' + n.content.user!.name, licon.BubbleSpeech, [
          h('span', [h('strong', userFullName(n.content.user)), drawTime(n)]),
          h('span', n.content.text),
        ]),
      text: n => userFullName(n.content.sender) + ': ' + n.content.text,
    },
    teamJoined: {
      html: n =>
        generic(n, '/team/' + n.content.id, licon.Group, [
          h('span', [h('strong', n.content.name), drawTime(n)]),
          h('span', trans.noarg('youAreNowPartOfTeam')),
        ]),
      text: n => trans('youHaveJoinedTeamX', n.content.name),
    },
    titledTourney: {
      html: n =>
        generic(n, '/tournament/' + n.content.id, licon.Trophy, [
          h('span', [h('strong', 'Lichess Titled Arena'), drawTime(n)]),
          h('span', n.content.text),
        ]),
      text: _ => 'Lichess Titled Arena',
    },
    reportedBanned: {
      html: n =>
        generic(n, undefined, licon.InfoCircle, [
          h('span', [h('strong', trans.noarg('someoneYouReportedWasBanned'))]),
          h('span', trans.noarg('thankYou')),
        ]),
      text: _ => trans.noarg('someoneYouReportedWasBanned'),
    },
    gameEnd: {
      html: n => {
        let result;
        switch (n.content.win) {
          case true:
            result = trans.noarg('congratsYouWon');
            break;
          case false:
            result = trans.noarg('defeat');
            break;
          default:
            result = trans.noarg('draw');
        }
        return generic(n, '/' + n.content.id, licon.PaperAirplane, [
          h('span', [h('strong', trans('gameVsX', userFullName(n.content.opponent))), drawTime(n)]),
          h('span', result),
        ]);
      },
      text: n => {
        let result;
        switch (n.content.win) {
          case true:
            result = trans.noarg('victory');
            break;
          case false:
            result = trans.noarg('defeat');
            break;
          default:
            result = trans.noarg('draw');
        }
        return trans('resVsX', result, userFullName(n.content.opponent));
      },
    },
    planStart: {
      html: n =>
        generic(n, '/patron', licon.Wings, [
          h('span', [h('strong', 'You just became a lichess Patron.'), drawTime(n)]),
        ]),
      text: _ => 'You just became a lichess Patron.',
    },
    planExpire: {
      html: n =>
        generic(n, '/patron', licon.Wings, [h('span', [h('strong', 'Patron account expired'), drawTime(n)])]),
      text: _ => 'Patron account expired',
    },
    ratingRefund: {
      html: n =>
        generic(n, '/faq#rating-refund', licon.InfoCircle, [
          h('span', [h('strong', trans.noarg('lostAgainstTOSViolator')), drawTime(n)]),
          h('span', trans('refundXpointsTimeControlY', n.content.points, n.content.perf)),
        ]),
      text: n => trans('refundXpointsTimeControlY', n.content.points, n.content.perf),
    },
    corresAlarm: {
      html: n =>
        generic(n, '/' + n.content.id, licon.PaperAirplane, [
          h('span', [h('strong', trans.noarg('timeAlmostUp')), drawTime(n)]),
          // not a `LightUser`, could be a game against Stockfish
          h('span', trans('gameVsX', n.content.op)),
        ]),
      text: _ => trans.noarg('timeAlmostUp'),
    },
    irwinDone: jobDone('Irwin'),
    kaladinDone: jobDone('Kaladin'),
  };
}

const jobDone = (name: string): Renderer => ({
  html: n =>
    generic(n, '/@/' + n.content.user!.name + '?mod', licon.Agent, [
      h('span', [h('strong', userFullName(n.content.user)), drawTime(n)]),
      h('span', `${name} job complete!`),
    ]),
  text: n => `${n.content.user!.name}: ${name} job complete!`,
});

function generic(n: Notification, url: string | undefined, icon: string, content: VNode[]): VNode {
  return h(
    url ? 'a' : 'span',
    {
      class: { site_notification: true, [n.type]: true, new: !n.read },
      attrs: { key: n.date, ...(url ? { href: url } : {}) },
    },
    [h('i', { attrs: { 'data-icon': icon } }), h('span.content', content)],
  );
}

function drawTime(n: Notification) {
  const date = new Date(n.date);
  return h(
    'time.timeago',
    { attrs: { title: date.toLocaleString(), datetime: n.date } },
    lichess.timeago(date),
  );
}

function userFullName(u?: LightUser) {
  if (!u) return 'Anonymous';
  return u.title ? u.title + ' ' + u.name : u.name;
}
