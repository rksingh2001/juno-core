import styled from 'styled-components'

interface WrapperType {
  isReplying: boolean
}

export const Wrapper = styled.div<WrapperType>`
  max-width: 850px;
  width: 100%;
  margin-left: ${(props) => (props.isReplying ? '10%' : 'auto')};
  margin-right: auto;
  position: static;
`

export const UpdateContainer = styled.div`
  min-height: 2rem;
`

export const ComposerContainer = styled.div`
  padding-top: 120px;
  padding-bottom: 121px;
`

export const Label = styled.div`
  position: absolute;
  left: -120px;
  width: 100px;
  text-align: right;
`

export const Row = styled.div`
  position: relative;
  min-height: 35px;
  display: flex;
  align-content: flex-start;
  padding: 0.25rem 0;
`
