import { css, StyleSheet } from "aphrodite";
import colors from "../../config/themes/colors";
import { ID } from "../../config/types/root_types";
import {
  getScrollToTargetElFnc,
  getTargetInlineDraftEntityEl,
} from "./util/InlineCommentThreadUtil";
import { ReactElement } from "react";

type Props = {
  commentThreadID: ID;
  entityKey: ID;
  onScrollSuccess: () => void;
  title: string;
};

export default function InlineCommentContextTitle({
  commentThreadID,
  entityKey,
  onScrollSuccess,
  title,
}: Props): ReactElement<"div"> {
  const animateAndScrollToTarget = getScrollToTargetElFnc({
    onSuccess: onScrollSuccess,
    targetElement: getTargetInlineDraftEntityEl({
      commentThreadID,
      entityKey,
    }),
  });
  return (
    <div
      className={css(styles.headerHighlightedTextContainer)}
      onClick={animateAndScrollToTarget}
      role="none"
    >
      <span className={css(styles.headerHighlightedText)}>{title}</span>
    </div>
  );
}

const styles = StyleSheet.create({
  headerHighlightedTextContainer: {
    alignItems: "center",
    borderLeft: `4px solid ${colors.GREY(1)}`,
    boxSizing: "border-box",
    display: "flex",
    fontFamily: "CharterBT",
    height: 24,
  },
  headerHighlightedText: {
    boxSizing: "border-box",
    color: colors.GREY(1),
    cursor: "pointer",
    fontSize: 16,
    fontStyle: "italic",
    height: 16,
    maxWidth: 860,
    overflow: "hidden",
    paddingLeft: 8,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
});
