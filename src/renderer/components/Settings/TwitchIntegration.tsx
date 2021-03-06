import * as React from "react";

import { useDispatch, useSelector } from "react-redux";
import { Header, Icon, Loader, Segment, Table } from "semantic-ui-react";
import { format } from "timeago.js";

import { Dispatch, iRootState } from "@/store";
import { TwitchClip } from "@/store/models/twitch";
import { TwitchConnectButton, TwitchUserStatus } from "../Misc/TwitchConnect";

export const ClipsTable: React.FC = props => {
    return (
        <Table celled padded>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell singleLine>Clip ID</Table.HeaderCell>
                    <Table.HeaderCell>Timestamp</Table.HeaderCell>
                    <Table.HeaderCell>Remove</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {props.children}
            </Table.Body>
        </Table>
    );
};

const ClipRow: React.FC<{
    clip: TwitchClip;
    onRemove: () => void;
}> = props => {
    return (
        <Table.Row key={props.clip.clipID}>
            <Table.Cell>
                <a href={`https://clips.twitch.tv/${props.clip.clipID}`} target="_blank">{props.clip.clipID}</a>
            </Table.Cell>
            <Table.Cell>
                {format(props.clip.timestamp * 1000)}
            </Table.Cell>
            <Table.Cell>
                <Icon name="trash" link onClick={props.onRemove}/>
            </Table.Cell>
        </Table.Row>
    );
};

export const TwitchIntegration = () => {
    const { twitchUser } = useSelector((state: iRootState) => state.tempContainer);
    const dispatch = useDispatch<Dispatch>();
    const { authToken, clips } = useSelector((state: iRootState) => state.twitch);
    const rows: JSX.Element[] = [];
    const allClips = Object.values(clips);
    allClips.sort((x, y) => {
        if (x.timestamp > y.timestamp) {
            return -1;
        }
        if (x.timestamp < y.timestamp) {
            return 1;
        }
        return 0;
    });
    for (const value of allClips) {
        const key = value.clipID;
        rows.push(
            <ClipRow
                key={`${key}--${value}`}
                clip={value}
                onRemove={() => {
                    dispatch.twitch.removeTwitchClip(key);
                }}
            />
        );
    }

    // If the name is not provided
    React.useEffect(() => {
        if (!twitchUser && authToken) {
            dispatch.tempContainer.updateUser(authToken);
        }
    });

    const onSignOut = () => {
        dispatch.twitch.clearAuthToken();
    };
    return (
        <div>
            <h2>Twitch Integration</h2>
            {!authToken ?
                <TwitchConnectButton onClick={() => dispatch.twitch.fetchTwitchToken()} />
                : twitchUser ?
                    <TwitchUserStatus
                        displayName={twitchUser.displayName}
                        image={twitchUser.profilePictureUrl}
                        channel={twitchUser.name}
                        onSignOut={onSignOut}
                    />
                    :
                    <Loader active={true} inline={true} content="Loading" />
            }
            <h2>Clips</h2>
            {rows.length > 0 ?
                <ClipsTable>{rows}</ClipsTable>
                :
                <Segment placeholder>
                    <Header icon>
                        <Icon name="twitch" />
                        You have not created any Twitch clips
                    </Header>
                </Segment>
            }
        </div>
    );
};
