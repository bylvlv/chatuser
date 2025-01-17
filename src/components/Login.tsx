import { Show, createSignal, onMount } from 'solid-js'
import { getParam } from '../utils/func'
import type { User } from '@/types'
import type { Setter } from 'solid-js'
interface Props {
  setIsLogin: Setter<boolean>
  setUser: Setter<User>
}

export default (props: Props) => {
  let emailRef: HTMLInputElement
  let codeRef: HTMLInputElement

  const [countdown, setCountdown] = createSignal(0)
  const [code, setCode] = createSignal('')

  onMount(() => {
    const shareCode = getParam('code')
    if (shareCode)
      setCode(shareCode)
  })

  const login = async() => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: emailRef.value,
        code: codeRef.value,
        shareCode: code(),
      }),
    })
    const responseJson = await response.json()
    if (responseJson.code === 200) {
      localStorage.setItem('token', responseJson.data.token)
      localStorage.setItem('user', JSON.stringify(responseJson.data))
      props.setIsLogin(true)
      props.setUser(responseJson.data)
    } else {
      alert(responseJson.message)
    }
  }

  const sendCode = async() => {
    if (!emailRef.value)
      alert('请输入邮箱')

    setCountdown(60)
    const intv = setInterval(() => {
      setCountdown(countdown() - 1)
      if (countdown() <= 0)
        clearInterval(intv)
    }, 1000)
    const response = await fetch('/api/sendCode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: emailRef.value,
      }),
    })
    const responseJson = await response.json()
    if (responseJson.code !== 200) {
      alert(responseJson.message)
      setCountdown(3)
    }
  }

  return (
    <div id="input_container" class="mt-4 w-full">
      <input
        ref={emailRef!}
        placeholder="邮箱"
        type="text"
        class="gpt-password-input w-full rounded-full"
        value=""
      />
      <div class="flex mt-4 justify-center items-center">
        <input
          ref={codeRef}
          id="code_input"
          class="gpt-password-input w-2/3 rounded-full"
          placeholder="验证码"
          v-model="data.form.verify_code"
        />
        <Show when={countdown() <= 0}>
          <button onClick={sendCode} class="w-1/3 h-12 px-2 py-2 bg-slate bg-op-15 hover:bg-op-20 rounded-full ml-2 bg-gradient-to-r text-rose-400">
            发送
          </button>
        </Show>
        <Show when={countdown() > 0}>
          <div class="w-1/3 h-12 px-2 leading-12 bg-slate bg-op-15 hover:bg-op-20 rounded-full ml-2 text-center text-rose-400">
            {countdown()}秒
          </div>
        </Show>
      </div>

      <button onClick={login} class="w-full h-12 mt-8 px-4 py-2 bg-slate bg-op-15 hover:bg-op-20 rounded-full bg-gradient-to-r from-rose-300 to-rose-400 text-white">
        开始使用
      </button>

      <Show when={code() !== ''}>
        <div class="op-60 py-4">
          邀请码: {code()}
        </div>
      </Show>
    </div>
  )
}
