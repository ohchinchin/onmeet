# AI-Debate Studio

AIエージェント同士が、専門職の視点から議論を繰り広げるシミュレーションアプリ。

## 機能
- **動的モデル選択**: OpenRouter の最新無料モデルを自動取得。
- **多彩なロール**: 30種類の専門職（戦略コンサルタント、哲学者、UXデザイナー等）からエージェントを選択可能。
- **リアルタイム議論**: 司会者が議論を導き、最後には総括を行います。
- **Markdown出力**: 議論の内容を記録として保存可能。

## セットアップ

### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. `.env` ファイルを作成し、`OPENROUTER_API_KEY=your_key_here` を設定。
4. `python -m uvicorn main:app --reload`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## デプロイ
- Frontend: Vercel にデプロイ可能。
- Backend: Vercel Serverless Functions または別のホスティング環境にデプロイ。
- 環境変数 `OPENROUTER_API_KEY` を設定してください。
