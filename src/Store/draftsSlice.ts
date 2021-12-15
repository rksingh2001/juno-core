/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit'
import isEmpty from 'lodash/isEmpty'
import { push } from 'redux-first-history'
import draftApi from '../data/draftApi'
import { setServiceUnavailable } from './utilsSlice'
import { setComposeEmail } from './composeSlice'
import { setCurrentEmail } from './emailDetailSlice'
import type { AppThunk, RootState } from './store'
import {
  DraftDetails,
  DraftsState,
  ComposedEmail,
  EnhancedDraftDetails,
  OpenDraftEmailType,
  DraftListObject,
} from './draftsTypes'
import bodyDecoder from '../utils/bodyDecoder'
import findPayloadHeadersData from '../utils/findPayloadHeadersData'

const initialState: DraftsState = Object.freeze({
  draftListLoaded: false,
  draftList: [],
  draftDetails: {},
})

export const draftsSlice = createSlice({
  name: 'drafts',
  initialState,
  reducers: {
    listAddDraft: (state, action) => {
      if (Array.isArray(action.payload)) {
        state.draftList = action.payload
      }
    },
    listRemoveDraft: (state, action) => {
      const { threadId } = action.payload
      const copyCurrentDraftList = state.draftList
      if (!Array.isArray(threadId)) {
        const newDraftList: DraftListObject[] = copyCurrentDraftList.filter(
          (item) => item.message.threadId !== threadId
        )
        state.draftList = newDraftList
      }
    },
    listUpdateDraft: (state, action) => {
      state.draftDetails = action.payload
    },
    setDraftListLoaded: (state, action) => {
      state.draftListLoaded = action.payload
    },
    resetDraftDetails: (state) => {
      state.draftDetails = {}
    },
  },
})

export const {
  listAddDraft,
  listUpdateDraft,
  listRemoveDraft,
  setDraftListLoaded,
  resetDraftDetails,
} = draftsSlice.actions

export const loadDraftList = (): AppThunk => async (dispatch) => {
  try {
    const draftList = await draftApi().getDrafts()
    if (draftList.message.resultSizeEstimate > 0) {
      dispatch(listAddDraft(draftList.message.drafts))
    } else {
      return null
    }
    return null
  } catch (err) {
    console.error(err)
    dispatch(setServiceUnavailable('Error getting Draft list.'))
  } finally {
    dispatch(setDraftListLoaded(true))
  }
  return null
}

export const CreateDraft = (): AppThunk => async (dispatch, getState) => {
  try {
    const { composeEmail }: any = getState().compose
    const { id, message } =
      getState().drafts.draftDetails && getState().drafts.draftDetails
    const baseComposedEmail: ComposedEmail = {
      draftId: id && id,
      threadId: message?.threadId && message.threadId,
      messageId: message?.id && message.id,
      labelIds: message?.labelIds && message.labelIds,
      to: composeEmail.to ?? [],
      subject: composeEmail.subject ?? '',
      body: composeEmail.body ?? '',
    }
    const response = await draftApi().createDrafts(baseComposedEmail)
    if (response && response.status === 200) {
      const {
        data: {
          message: { data },
        },
      } = response
      dispatch(listUpdateDraft(data))
    } else {
      dispatch(setServiceUnavailable('Cannot create draft.'))
    }
  } catch (err) {
    console.error(err)
    dispatch(setServiceUnavailable('Cannot create draft.'))
  }
}

export const UpdateDraft = (): AppThunk => async (dispatch, getState) => {
  try {
    const { composeEmail } = getState().compose
    const { id, message } =
      getState().drafts.draftDetails && getState().drafts.draftDetails
    const baseComposedEmail = {
      draftId: id && id,
      threadId: message?.threadId && message.threadId,
      messageId: message?.id && message.id,
      labelIds: message?.labelIds && message.labelIds,
      to: composeEmail.to ?? [],
      cc: composeEmail.cc ?? [],
      subject: composeEmail.subject ?? '',
      body: composeEmail.body ?? '',
    }

    const response = await draftApi().updateDrafts(baseComposedEmail)
    if (response && response.status === 200) {
      console.log(response)
      const {
        data: {
          message: { data },
        },
      } = response
      dispatch(listUpdateDraft(data))
    } else {
      dispatch(setServiceUnavailable('Cannot update draft.'))
    }
  } catch (err) {
    console.error(err)
    dispatch(setServiceUnavailable('Cannot update draft.'))
  }
}

const pushDraftDetails = (props: EnhancedDraftDetails): AppThunk => {
  const {
    draft,
    draft: { message },
  } = props
  return (dispatch) => {
    try {
      const body = bodyDecoder(message.payload).map((item) =>
        item.replace(/<[^>]*>/g, '')
      )
      const subject = findPayloadHeadersData('Subject', message)
      const to = findPayloadHeadersData('To', message)
      const loadEmail = {
        to,
        subject,
        body,
      }
      const draftDetails = {
        id: draft.id && draft.id,
        message: {
          id: message.id && message.id,
          threadId: message.threadId && message.threadId,
        },
      }
      if (draft.id) {
        dispatch(listUpdateDraft(draftDetails))
        dispatch(setComposeEmail(loadEmail))
        dispatch(setCurrentEmail(draft.id))
        dispatch(push(`/compose/${draft.id}`))
      } else {
        dispatch(push(`/compose/`))
      }
    } catch (err) {
      console.error(err)
      dispatch(setServiceUnavailable('Error setting up compose email.'))
    }
  }
}

const loadDraftDetails = (draftDetails: DraftDetails): AppThunk => {
  const { draftId } = draftDetails
  return async (dispatch) => {
    try {
      const response = await draftApi().getDraftDetail(draftId)
      if (response?.status && response.status === 200) {
        const { draft } = response.data
        dispatch(pushDraftDetails({ draft }))
      }
    } catch (err) {
      console.error(err)
      dispatch(setServiceUnavailable('Error setting up compose email.'))
    }
  }
}

export const openDraftEmail = (props: OpenDraftEmailType): AppThunk => {
  const { messageId, id } = props
  return async (dispatch, getState) => {
    try {
      // If Draft list is empty, fetch it first.
      if (isEmpty(getState().drafts.draftList)) {
        const res = await draftApi().getDrafts()
        if (res.status === 200) {
          if (res.data.message.resultSizeEstimate > 0) {
            const {
              data: {
                message: { drafts },
              },
            } = res
            const draftId = drafts.filter(
              (draft: any) => draft.message.id === messageId
            )
            if (!isEmpty(draftId)) {
              dispatch(loadDraftDetails({ draftId }))
            }
          } else {
            dispatch(setServiceUnavailable('Error setting up compose email.'))
          }
        }
      }
      const { draftList } = getState().drafts

      // Search the draftList on message.threadId to get the id. Use that Id to fetch all the details of the draft.
      const selectedEmail =
        draftList && messageId
          ? draftList.filter((draft) => draft.message.id === messageId)
          : draftList.filter((draft) => draft.message.threadId === id)

      if (selectedEmail.length > 0) {
        const draftId = selectedEmail[0].id
        dispatch(loadDraftDetails({ draftId }))
      }
    } catch (err) {
      console.error(err)
      dispatch(setServiceUnavailable('Error setting up compose email.'))
    }
  }
}

export const selectDraft = (state: RootState) => state.drafts.draftList
export const selectDraftListLoaded = (state: RootState) =>
  state.drafts.draftListLoaded
export const selectDraftDetails = (state: RootState) =>
  state.drafts.draftDetails

export default draftsSlice.reducer
